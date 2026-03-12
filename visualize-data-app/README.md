# visualize-data-app

Simple Node+Express web app that serves a JSON file and provides basic visualizations and QC statistics.

Quick start

1. Install dependencies:

```bash
cd visualize-data-app
npm install
```

2. Ensure your data file exists. By default the server reads `/Users/xinliu/Desktop/codetest/data.json`.
   You can override with env var `DATA_FILE`.

3. Run the app:

```bash
# default
npm start

# or with custom data path
DATA_FILE=/path/to/data.json npm start
```

4. Open http://localhost:3000 in your browser.

Pushing to GitHub

I cannot push to your GitHub repository without authentication. To push this project to a new repo under your account you can either:

- Create a repo on GitHub and then run:

```bash
git init
git add .
git commit -m "init: data visualizer"
git remote add origin git@github.com:llllx505/visualize-data-app.git
git push -u origin main
```

- Or use the GitHub CLI `gh` to create and push (recommended):

```bash
gh repo create llll x505/visualize-data-app --public --source=. --remote=origin --push
```

If you want me to push for you, provide a GitHub Personal Access Token (with `repo` scope) or grant `gh` CLI access — I will then programmatically create the repo and push. Do you want me to proceed with automated push? If yes, provide the preferred repo name and a token.
