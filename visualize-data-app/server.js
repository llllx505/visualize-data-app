const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow configuring the data file path via env var. Default to user's Desktop path provided.
const DATA_FILE = process.env.DATA_FILE || '/Users/xinliu/Desktop/codetest/data.json';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: `Unable to read data file: ${err.message}` });
      return;
    }
    try {
      const parsed = JSON.parse(data);
      // If the stored JSON is an object (mapping keys to records), convert to an array
      let out = parsed;
      if (!Array.isArray(parsed) && parsed && typeof parsed === 'object') {
        out = Object.keys(parsed).map(k => {
          const v = parsed[k];
          const rec = v && typeof v === 'object' ? Object.assign({ id: k }, v) : { id: k, value: v };
          // parse embedded JSON-like strings in result_* fields
          Object.keys(rec).forEach(f => {
            if (/^result_/.test(f) && typeof rec[f] === 'string') {
              const s = rec[f];
              const start = s.indexOf('{');
              const end = s.lastIndexOf('}');
              if (start !== -1 && end !== -1 && end > start) {
                const inner = s.slice(start, end + 1).replace(/'/g, '"');
                try {
                  rec[f] = JSON.parse(inner);
                } catch (err) {
                  // leave as original string when parsing fails
                  rec[f] = s;
                }
              }
            }
          });
          return rec;
        });
      }
      res.json(out);
    } catch (e) {
      res.status(500).json({ error: `Invalid JSON: ${e.message}` });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Serving data from: ${DATA_FILE}`);
});
