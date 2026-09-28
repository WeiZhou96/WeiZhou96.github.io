# Wei Zhou — Academic Website

English academic website with a full-screen animated globe, Clawd typing introduction, searchable publications, BibTeX export, and printable CV. Animation can be paused and respects reduced-motion preferences. All visual assets are served locally.

## Build and preview

Requires Python 3.10 or newer. No additional packages are needed.

```sh
python -X utf8 build_release.py
python -X utf8 verify_release.py
python -X utf8 preview.py --release --port 18963
```

Open http://127.0.0.1:18963/ to preview the production website. The generated `dist/` directory is the complete deployment artifact. The classic design remains under `site/` for local comparison.

## Editing

- `content/profile.json`: biography, research, news, and academic activities.
- `content/publications.json`: publication metadata and categories.
- `build.py` and `build_expressive.py`: page templates.
- `site/expressive/`: design styles, globe animation, and Clawd typing script.
- `site/assets/`: portrait, spritesheet, shared styles, and publication controls.

Edit source files and rebuild. Generated HTML and `dist/` are excluded from Git.

## GitHub Pages

Target website: https://weizhou96.github.io/ in the public repository `WeiZhou96/WeiZhou96.github.io`. Public repositories can use GitHub Pages on the free plan, without a purchased domain or server.

The workflow at `.github/workflows/pages.yml` supports source files at the repository root or in a `website/` subdirectory when integrated into the existing repository. Set **Settings → Pages → Build and deployment → Source → GitHub Actions**. Pushes to `main` or `master` publish automatically; manual deployment is also available from those branches.

Only the generated `dist/` directory is deployed. When integrating into the existing repository, preserve its history and place the new source under `website/` with the workflow at the repository root. Restoring the older site also requires restoring its Pages build configuration. Local source notes and screenshots are excluded from source control and deployment.

## Content

Content reviewed on 2026-09-28 against public university records and DOI metadata. Papers announced online in 2026 with 2027 issue assignments retain both dates.
