# Majid Nazeer — academic portfolio

A minimal static academic site — no build step, no dependencies. Inspired by clean faculty profiles like [Coco Kwok's portfolio](https://cocokwok.github.io/).

```
index.html      About, Research, Publications
codes.html      GitHub repositories
datasets.html   Released data products
data.js         All content — edit publications, codes, datasets here
script.js       Theme, navigation, rendering
styles.css      Layout and theme
assets/         Portrait photo
```

## Pages

| Page | Content |
|---|---|
| **index.html** | About, Research, Publications |
| **codes.html** | GitHub repositories |
| **datasets.html** | Released data products |

## Deploy to GitHub Pages

Same approach as [cocokwok.github.io](https://cocokwok.github.io/) — push to a GitHub repo and enable Pages.

### Option A — User site (`username.github.io`)

1. Create a repository named `<username>.github.io`.
2. Push this folder to the `main` branch.
3. **Settings → Pages → Build and deployment → Source:** *GitHub Actions*.
4. The included workflow (`.github/workflows/pages.yml`) deploys automatically on every push.

Live URL: `https://<username>.github.io/`

### Option B — Project site (`username.github.io/repo-name`)

1. Create any repository (e.g. `majid-nazeer`).
2. Push to `main`, enable Pages with GitHub Actions.
3. Live URL: `https://<username>.github.io/majid-nazeer/`

### Quick start

```bash
git init
git add .
git commit -m "Academic portfolio"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Preview locally: `python -m http.server 8000` → open `http://localhost:8000`

## Adding publications

The list shows **all papers from Google Scholar**, grouped by year (2026 → earliest). Edit `PUBLICATIONS` in `data.js`. Keep `year` accurate — the page groups and sorts automatically.

## Adding codes (GitHub repos)

Edit the `CODES` array in `data.js`:

```js
{
  title: "Repository name",
  url: "https://github.com/username/repo",
  lang: "Python",
  desc: "Short description of what the code does."
}
```

## Adding datasets

Edit the `DATASETS` array in `data.js`:

```js
{
  title: "Dataset name",
  url: "https://github.com/username/dataset-repo",
  format: "GeoTIFF / CSV",
  desc: "What the dataset contains and how to cite it."
}
```

When entries exist, the placeholder on the relevant page disappears automatically.

## Portrait

Replace `assets/majid-nazeer.jpg` with the official photo from the
[PolyU staff page](https://www.polyu.edu.hk/lsgs/people/academic-staff/dr-majid-nazeer/).
Keep the filename the same.

## Theme

Light mode is the default. Visitors can switch to dark mode via the toggle in the header; the choice is saved in `localStorage`.
