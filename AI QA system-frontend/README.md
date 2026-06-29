# Instructional Design QA System — Frontend

React + Vite UI for the ID QA backend. Upload a storyboard, watch analysis
progress, and review the per-slide annotated report, principle scorecard, and
learning-objective alignment matrix.

## Screens

| Route | Screen | What it shows |
|-------|--------|---------------|
| `/` | **Upload** | Drag-drop `.pptx/.docx/.xlsx`, format detection, submit |
| `/report/:reviewId` | **Report** | Polls every 3s until complete. Left: principle scorecard (🔴/🟠/🟡/✅, click to filter). Right: findings grouped by slide as evidence cards with Accept/Reject/Edit. Tab: alignment matrix. Banner: parse warnings. |
| `/admin` | **Rubric** | Read-only view of all 50 rules / 14 principles. |

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server proxies `/api/*` to the backend (default `http://localhost:8000`).
Point it elsewhere with `VITE_API_TARGET`:

```bash
VITE_API_TARGET=http://localhost:8000 npm run dev
```

Make sure the backend is running first (see the backend repo's README).

## Build

```bash
npm run build        # outputs to dist/
npm run preview      # serve the production build
```
