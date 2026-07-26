# Restoring a "Skinnied Down" Project

Steps to bring a project back to a runnable state after deleting `node_modules/`, `dist/`, `build/`, and similar regenerable folders.

**Prerequisite for all projects:** `package.json` and `package-lock.json` must still be present. Without `package-lock.json` you'll still get working dependencies, but not necessarily the exact same versions you had before.

---

## Quick Reference

| Project type | Restore command | Run command |
|---|---|---|
| Frontend — Vite | `npm install` | `npm run dev` |
| Frontend — Create React App | `npm install` | `npm start` |
| Frontend — plain HTML/CSS/JS | nothing to install | open `index.html` or serve statically |
| Backend — Node/Express | `npm install` | `npm start` or `node index.js` |
| Backend — with portable-mongodb | `npm install` (or `npm install portable-mongodb` first) | `node app.js` |

---

## Frontend Restore

### 1. Vite projects (default assumption)

```bash
cd path/to/project
npm install
npm run dev
```

- Dev server usually starts on `http://localhost:5173`.
- If you previously ran a production build, `npm run build` regenerates `dist/`, and `npm run preview` serves it (commonly on port `4173`).
- Confirm it's Vite by checking `package.json` for `"vite"` in `devDependencies` and a `vite.config.js` file in the root.

```bash
# Optional: rebuild and preview a production bundle
npm run build
npm run preview
```

### 2. Non-Vite frontend options

**Create React App (CRA)** — look for `react-scripts` in `package.json`:

```bash
cd path/to/project
npm install
npm start
```

Dev server usually starts on `http://localhost:3000`.

**Webpack (custom config, no CRA/Vite)** — look for `webpack.config.js`:

```bash
cd path/to/project
npm install
npm run dev      # or: npm run start — check "scripts" in package.json
```

**Plain static HTML/CSS/JS (no bundler, no `package.json`, or an empty one)**

Nothing to install. Either:

```bash
# Open directly
start index.html          # Windows
```

or serve it so relative paths/fetch calls behave correctly:

```bash
npx serve .
```

**Not sure which type it is?** Check `package.json`:

```bash
cat package.json
```

| If you see... | It's likely... |
|---|---|
| `"vite"` in devDependencies, `vite.config.js` present | Vite |
| `"react-scripts"` in dependencies | Create React App |
| `webpack.config.js` present, no CRA/Vite | Custom Webpack |
| No `package.json`, or one with no build tooling | Plain static site |

---

## Backend Restore (Node/Express)

### 1. Standard Express project

```bash
cd path/to/project
npm install
npm start           # or: node index.js / node app.js / node server.js — check package.json "main" and "scripts"
```

Check `package.json` for the actual entry file and scripts if `npm start` isn't defined:

```bash
cat package.json
```

Look at the `"scripts"` block for the real start command, and `"main"` for the entry file if you need to run it directly with `node`.

### 2. Backend using `portable-mongodb`

This is the case where restore is **not** just `npm install` — deleting `node_modules` also deleted your database.

```bash
cd path/to/project
npm install portable-mongodb
npm install
```

> First install of `portable-mongodb` re-downloads the MongoDB binaries and can take 4–15 minutes. This is expected.

**Important:** your data is gone. `portable-mongodb` stores its files inside `node_modules/portable-mongodb/mongodb-data/`, so deleting `node_modules` wiped the database along with it. After restore you'll have a fresh, empty database — re-run any seed scripts you have, or re-create test data manually.

Then start the server as usual:

```bash
node app.js
```

Confirm your `app.js` (or equivalent) still has the two-step connection pattern — this doesn't change on restore, just flagging it since it's easy to "fix" by accident if you're rebuilding from a partial file:

```javascript
await portableMongo.connectToDatabase("YourDBName");
await mongoose.connect("mongodb://127.0.0.1:27017/YourDBName");
```

### 3. Backend using MongoDB Atlas (cloud) instead

Nothing extra to restore beyond `npm install` — but confirm your `.env` file (not tracked in git) still has a valid `MONGODB_URI` connection string, since `.env` files are sometimes accidentally deleted alongside cleanup.

```bash
cat .env    # PowerShell: type .env
```

---

## Full Restore Checklist

- [ ] `package.json` and `package-lock.json` present
- [ ] `npm install` completes without errors
- [ ] `.env` file present and populated (if the project uses one — not tracked in git, so cleanup or a fresh clone won't include it)
- [ ] Correct port free (recall: IIS occupies port 80 on this machine, so backend projects typically run on an alternate port like `3060`)
- [ ] For portable-mongodb projects: re-seed the database, since prior data was lost with `node_modules`
- [ ] Frontend dev server points at the correct backend URL/port (check `.env`, `vite.config.js` proxy settings, or wherever the API base URL is set)

---

## Troubleshooting

**`npm install` fails or hangs on portable-mongodb download**
Check your network connection; the binary download is large. Retry — it resumes/retries on its own in most cases.

**Port already in use**
```powershell
# PowerShell — find what's using a port
Get-NetTCPConnection -LocalPort 3060 | Select-Object OwningProcess
```
Then either stop that process or change the port in your app's config/`.env`.

**`npm start` does nothing / "missing script"**
The project may use a different script name or expect you to run the entry file directly with `node`. Check `"scripts"` in `package.json`.
