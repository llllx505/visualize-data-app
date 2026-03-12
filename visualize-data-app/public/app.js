async function fetchData() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

function isNumberArray(arr) {
  return arr.every(v => typeof v === 'number' && !Number.isNaN(v));
}

function stats(values) {
  const n = values.length;
  if (n === 0) return {};
  const sorted = values.slice().sort((a,b)=>a-b);
  const sum = values.reduce((a,b)=>a+b,0);
  const mean = sum / n;
  const median = (n%2===1)? sorted[(n-1)/2] : (sorted[n/2-1]+sorted[n/2])/2;
  const min = sorted[0];
  const max = sorted[sorted.length-1];
  const uniq = new Set(values).size;
  const variance = values.reduce((a,b)=>a+(b-mean)*(b-mean),0)/n;
  const sd = Math.sqrt(variance);
  return { n, sum, mean, median, min, max, uniq, sd };
}

function renderPlot(values, field) {
  const binsInput = document.getElementById('bins');
  const bins = binsInput ? Math.max(1, parseInt(binsInput.value) || 10) : 10;
  const trace = { x: values, type: 'histogram', nbinsx: bins, marker: { color: '#4C78A8' } };
  const layout = { title: `Histogram: ${field}`, xaxis: { title: field }, yaxis: { title: 'Count' } };
  Plotly.newPlot('plot', [trace], layout, {responsive:true});
}

function renderStats(s, field) {
  const el = document.getElementById('stats');
  if (!s) {
    el.innerText = `Field: ${field}\nNo numeric values available for this field.`;
    return;
  }
  el.innerText = `Field: ${field}\nCount: ${s.n}\nMean: ${s.mean}\nMedian: ${s.median}\nMin: ${s.min}\nMax: ${s.max}\nUnique: ${s.uniq}\nStdDev: ${s.sd}`;
}

function generateQC(data) {
  // Generic QC: for each key, count missing, unique types, sample values
  const qc = {};
  if (!Array.isArray(data)) return { error: 'Data is not an array' };
  const n = data.length;
  const keys = new Set();
  data.forEach(row => Object.keys(row||{}).forEach(k=>keys.add(k)));
  keys.forEach(k => {
    let missing = 0;
    const types = new Set();
    const uniq = new Set();
    const numValues = [];
    data.forEach(row => {
      const v = row ? row[k] : undefined;
      if (v === null || v === undefined || v === '') missing++;
      else types.add(typeof v);
      uniq.add(String(v));
      if (typeof v === 'number' && !Number.isNaN(v)) numValues.push(v);
    });
    qc[k] = { missing, missingPct: (missing/n), types: Array.from(types), uniqueCount: uniq.size, numericCount: numValues.length };
    if (numValues.length>0) qc[k].stats = stats(numValues);
  });
  return qc;
}

function populateFieldSelect(fields) {
  const sel = document.getElementById('fieldSelect');
  sel.innerHTML = '';
  fields.forEach(f => {
    const opt = document.createElement('option'); opt.value = f; opt.innerText = f; sel.appendChild(opt);
  });
}

async function init() {
  try {
    const data = await fetchData();
    if (!Array.isArray(data)) {
      document.getElementById('qc').innerText = 'Expected an array of objects in JSON.';
      return;
    }
    
    // Render version comparison first
    renderVersionComparison(data);
    
    const keys = new Set();
    data.forEach(r => Object.keys(r||{}).forEach(k=>keys.add(k)));
    // build field list, including nested numeric subfields for objects (e.g. result_v1.score)
    const keyList = [];
    Array.from(keys).forEach(k => {
      // collect subkeys across data
      const subkeys = new Set();
      data.forEach(r => {
        const v = r && r[k];
        if (v && typeof v === 'object') Object.keys(v).forEach(sk=>subkeys.add(sk));
      });
      if (subkeys.size>0) {
        // add top-level key label too
        keyList.push(k);
        Array.from(subkeys).forEach(sk => keyList.push(`${k}.${sk}`));
      } else {
        keyList.push(k);
      }
    });
    populateFieldSelect(keyList);
    // choose a default field: prefer the first field that has numeric values (including nested)
    function getNestedValue(obj, path) {
      const parts = path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    }
    const numericFields = keyList.filter(f => data.some(r => typeof getNestedValue(r, f) === 'number' && !Number.isNaN(getNestedValue(r, f))));
    if (numericFields.length > 0) {
      document.getElementById('fieldSelect').value = numericFields[0];
    }
    const qc = generateQC(data);
    document.getElementById('qc').innerText = JSON.stringify(qc, null, 2);

    function renderRaw(values) {
      const raw = document.getElementById('raw');
      if (!raw) return;
      const sample = values.slice(0, 200);
      raw.innerText = sample.join(', ')+ (values.length>sample.length ? `\n... (+${values.length-sample.length} more)` : '');
    }

    function update() {
      const field = document.getElementById('fieldSelect').value;
      const values = data.map(r => getNestedValue(r, field)).filter(v=>typeof v === 'number' && !Number.isNaN(v));
      const msg = document.getElementById('message');
      if (!values || values.length === 0) {
        if (window.Plotly) try { Plotly.purge('plot'); } catch (e) {}
        renderStats(null, field);
        if (msg) msg.innerText = 'No numeric values found for the selected field. Try another field.';
        renderRaw([]);
        return;
      }
      if (msg) msg.innerText = '';
      renderPlot(values, field);
      renderStats(stats(values), field);
      renderRaw(values.map(v => typeof v === 'number' ? v : String(v)));
    }

    document.getElementById('fieldSelect').addEventListener('change', update);
    document.getElementById('refreshBtn').addEventListener('click', init);

    if (keyList.length>0) update();
    // render image QC comparison
    renderImageComparison(data);
  } catch (e) {
    document.getElementById('qc').innerText = 'Error: '+e.message;
  }
}

// ============= Version Comparison =============

function renderVersionComparison(data) {
  if (!Array.isArray(data) || data.length === 0) {
    document.getElementById('versionComparison').innerHTML = '<p>No data available.</p>';
    return;
  }

  // Extract all versions
  const versionMetrics = {};
  
  data.forEach(record => {
    if (!record) return;
    const keys = Object.keys(record);
    
    // Find all version keys (e.g., result_v1, result_v2)
    keys.forEach(key => {
      const match = key.match(/^result_(v\d+)$/);
      if (match) {
        const versionName = match[1];
        if (!versionMetrics[versionName]) {
          versionMetrics[versionName] = { metrics: {}, count: 0 };
        }
        
        const result = parseResult(record[key]);
        if (typeof result === 'object') {
          Object.entries(result).forEach(([metricName, value]) => {
            if (typeof value === 'number' && !Number.isNaN(value)) {
              if (!versionMetrics[versionName].metrics[metricName]) {
                versionMetrics[versionName].metrics[metricName] = [];
              }
              versionMetrics[versionName].metrics[metricName].push(value);
            }
          });
        }
        versionMetrics[versionName].count++;
      }
    });
  });

  // Calculate averages
  const versionStats = {};
  Object.entries(versionMetrics).forEach(([vername, data]) => {
    versionStats[vername] = {};
    Object.entries(data.metrics).forEach(([metricName, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      versionStats[vername][metricName] = { avg, min, max, count: values.length };
    });
  });

  // Render comparison table
  const versionNames = Object.keys(versionStats).sort();
  if (versionNames.length === 0) {
    document.getElementById('versionComparison').innerHTML = '<p>No version data found.</p>';
    return;
  }

  // Get all metrics
  const allMetrics = new Set();
  Object.values(versionStats).forEach(stats => {
    Object.keys(stats).forEach(m => allMetrics.add(m));
  });

  let html = `<table style="width:100%;border-collapse:collapse;font-size:0.95rem">
    <thead style="background:#2c3e50;color:white">
      <tr>
        <th style="border:1px solid #bbb;padding:10px;text-align:left">Metric</th>`;
  
  versionNames.forEach(vname => {
    html += `<th style="border:1px solid #bbb;padding:10px;text-align:center;background:#34495e">${vname}</th>`;
  });
  html += `</tr></thead><tbody>`;

  // Render metrics
  Array.from(allMetrics).sort().forEach(metric => {
    html += `<tr style="background:#f8f9fa"><td style="border:1px solid #ddd;padding:10px;font-weight:bold">${metric}</td>`;
    
    let metricValues = [];
    versionNames.forEach(vname => {
      const value = versionStats[vname][metric];
      if (value) {
        metricValues.push(value.avg);
      }
    });

    versionNames.forEach(vname => {
      const value = versionStats[vname][metric];
      let cellStyle = 'border:1px solid #ddd;padding:10px;text-align:center';
      
      if (value) {
        // Highlight best (max value)
        if (metricValues.length > 0 && value.avg === Math.max(...metricValues)) {
          cellStyle += ';background:#d4edda;color:#155724;font-weight:bold';
        }
        html += `<td style="${cellStyle}">
          <div style="font-weight:bold;font-size:1.1rem">${value.avg.toFixed(4)}</div>
          <div style="font-size:0.85rem;color:#666">[${value.min.toFixed(4)}, ${value.max.toFixed(4)}]</div>
        </td>`;
      } else {
        html += `<td style="${cellStyle}">N/A</td>`;
      }
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  html += `<div style="margin-top:12px;font-size:0.9rem;color:#666">
    <p><strong>说明：</strong> 表格显示每个版本在所有图像上的平均指标</p>
    <p>绿色背景 = 该指标的最佳版本 | [min, max] = 最小值和最大值范围</p>
  </div>`;

  document.getElementById('versionComparison').innerHTML = html;
}

// ============= Image QC Comparison =============

function extractVersions(record) {
  const versions = {};
  const versionPattern = /_(v\d+)$/;
  const keys = Object.keys(record);
  // Find all version numbers
  const versionNums = new Set();
  keys.forEach(k => {
    const m = k.match(versionPattern);
    if (m) versionNums.add(m[1]);
  });
  // Group by version
  Array.from(versionNums).sort().forEach(vname => {
    versions[vname] = {
      caption: record[`caption_${vname}`] || 'N/A',
      result: record[`result_${vname}`] || 'N/A'
    };
  });
  return versions;
}

function parseResult(resultStr) {
  if (typeof resultStr !== 'string') return resultStr;
  // Try to extract JSON from "```json {...}"
  const start = resultStr.indexOf('{');
  const end = resultStr.lastIndexOf('}');
  if (start === -1 || end === -1) return resultStr;
  const jsonStr = resultStr.slice(start, end + 1).replace(/'/g, '"');
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return resultStr;
  }
}

function calculateDifference(result1, result2) {
  if (typeof result1 !== 'object' || typeof result2 !== 'object') return null;
  const diff = {};
  const keys = new Set([...Object.keys(result1), ...Object.keys(result2)]);
  keys.forEach(k => {
    const v1 = result1[k];
    const v2 = result2[k];
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      diff[k] = { v1, v2, delta: Math.abs(v1 - v2), pctDiff: Math.abs(v1 - v2) / Math.max(Math.abs(v1), Math.abs(v2), 1) * 100 };
    }
  });
  return diff;
}

function renderImageComparison(data) {
  // Convert object to array if needed
  let imageList = [];
  if (Array.isArray(data)) {
    imageList = data.filter(r => r && r.id && /\.(jpg|jpeg|png|gif)$/i.test(r.id));
  } else if (typeof data === 'object') {
    imageList = Object.keys(data).filter(k => /\.(jpg|jpeg|png|gif)$/i.test(k))
      .map(id => ({ id, ...data[id] }));
  }
  
  if (imageList.length === 0) {
    document.getElementById('imageComparison').innerHTML = '<p>No image records found.</p>';
    return;
  }

  let currentIndex = 0;
  let sortMode = 'id';
  let showOnlyDiff = false;
  let sortedList = [...imageList];

  function updateSortAndFilter() {
    sortedList = [...imageList];
    if (sortMode === 'max-diff') {
      sortedList.forEach(img => {
        const versions = extractVersions(img);
        const versionNames = Object.keys(versions).sort();
        let maxDiff = 0;
        for (let i = 0; i < versionNames.length - 1; i++) {
          const r1 = parseResult(versions[versionNames[i]].result);
          const r2 = parseResult(versions[versionNames[i + 1]].result);
          const diff = calculateDifference(r1, r2);
          if (diff) {
            Object.values(diff).forEach(d => {
              maxDiff = Math.max(maxDiff, d.delta);
            });
          }
        }
        img._maxDiff = maxDiff;
      });
      sortedList.sort((a, b) => (b._maxDiff || 0) - (a._maxDiff || 0));
    }

    if (showOnlyDiff) {
      sortedList = sortedList.filter(img => {
        const versions = extractVersions(img);
        const versionNames = Object.keys(versions).sort();
        for (let i = 0; i < versionNames.length - 1; i++) {
          const r1 = parseResult(versions[versionNames[i]].result);
          const r2 = parseResult(versions[versionNames[i + 1]].result);
          const diff = calculateDifference(r1, r2);
          if (diff && Object.keys(diff).length > 0) return true;
        }
        return false;
      });
    }
  }

  function renderCurrent() {
    updateSortAndFilter();
    if (sortedList.length === 0) {
      document.getElementById('imageComparison').innerHTML = '<p>No images to display.</p>';
      return;
    }
    currentIndex = Math.min(currentIndex, sortedList.length - 1);
    const img = sortedList[currentIndex];
    const versions = extractVersions(img);
    const versionNames = Object.keys(versions).sort();

    let html = `<div style="margin-bottom:12px">
      <strong>Image: ${img.id}</strong>
      <span style="color:#666;margin-left:12px">Showing ${currentIndex + 1} of ${sortedList.length} images</span>
    </div>`;

    if (versionNames.length === 0) {
      html += '<p>No version data found.</p>';
      document.getElementById('imageComparison').innerHTML = html;
      return;
    }

    // Image display
    html += `<div style="margin-bottom:16px;text-align:center">
      <img src="${img.id}" alt="${img.id}" style="max-width:100%;max-height:400px;border:1px solid #ddd;border-radius:4px" onerror="this.innerHTML='Image failed to load'">
    </div>`;

    // Version comparison table
    html += `<div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
        <thead style="background:#f5f5f5">
          <tr>
            <th style="border:1px solid #ddd;padding:8px">Field</th>`;
    
    versionNames.forEach(v => {
      html += `<th style="border:1px solid #ddd;padding:8px;background:#e8f4f8">${v}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Caption row
    html += `<tr><td style="border:1px solid #ddd;padding:8px;font-weight:bold;">Caption</td>`;
    versionNames.forEach(v => {
      const caption = versions[v].caption;
      html += `<td style="border:1px solid #ddd;padding:8px">${caption}</td>`;
    });
    html += `</tr>`;

    // Result metrics rows
    let allMetrics = new Set();
    versionNames.forEach(v => {
      const result = parseResult(versions[v].result);
      if (typeof result === 'object') {
        Object.keys(result).forEach(k => allMetrics.add(k));
      }
    });

    Array.from(allMetrics).sort().forEach(metric => {
      html += `<tr><td style="border:1px solid #ddd;padding:8px;font-weight:bold;">${metric}</td>`;
      versionNames.forEach(v => {
        const result = parseResult(versions[v].result);
        const value = typeof result === 'object' ? result[metric] : 'N/A';
        let cellStyle = 'border:1px solid #ddd;padding:8px';
        html += `<td style="${cellStyle}">${typeof value === 'number' ? value.toFixed(4) : value}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;

    // Difference analysis
    if (versionNames.length > 1) {
      html += `<div style="margin-top:16px;padding:12px;background:#fff9e6;border:1px solid #ffe6b3;border-radius:4px">
        <strong style="color:#b8860b">Version Differences:</strong>`;
      for (let i = 0; i < versionNames.length - 1; i++) {
        const v1 = versionNames[i];
        const v2 = versionNames[i + 1];
        const r1 = parseResult(versions[v1].result);
        const r2 = parseResult(versions[v2].result);
        const diff = calculateDifference(r1, r2);
        html += `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.5);border-radius:4px">
          <strong>${v1} vs ${v2}:</strong>`;
        if (diff && Object.keys(diff).length > 0) {
          html += `<ul style="margin:4px 0;padding-left:20px">`;
          Object.entries(diff).forEach(([k, d]) => {
            const color = d.delta > 0.1 ? '#d9534f' : '#5cb85c';
            html += `<li><strong>${k}</strong>: ${d.v1.toFixed(4)} → ${d.v2.toFixed(4)} (Δ ${d.delta.toFixed(4)}, ${d.pctDiff.toFixed(1)}%)</li>`;
          });
          html += `</ul>`;
        } else {
          html += `<span style="color:#999">No differences detected</span>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }

    document.getElementById('imageComparison').innerHTML = html;
    document.getElementById('imageCounter').innerText = `${currentIndex + 1} / ${sortedList.length}`;
  }

  document.getElementById('sortBy').addEventListener('change', (e) => {
    sortMode = e.target.value;
    currentIndex = 0;
    renderCurrent();
  });

  document.getElementById('showOnlyDiff').addEventListener('change', (e) => {
    showOnlyDiff = e.target.checked;
    currentIndex = 0;
    renderCurrent();
  });

  document.getElementById('prevImageBtn').addEventListener('click', () => {
    updateSortAndFilter();
    currentIndex = Math.max(0, currentIndex - 1);
    renderCurrent();
  });

  document.getElementById('nextImageBtn').addEventListener('click', () => {
    updateSortAndFilter();
    currentIndex = Math.min(sortedList.length - 1, currentIndex + 1);
    renderCurrent();
  });

  renderCurrent();
}

init();
