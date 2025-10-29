# Research site — Shivam Mittal

Publications and research projects. Minimal static site.

## Local preview
- Open `index.html` in your browser.

## Update content
- Edit `data/research.json`. Each item supports:
  - `title` (string)
  - `authors` (array of strings)
  - `venue` (string)
  - `year` (number)
  - `links` (array of `{ label, href }`)
  - `summary` (string, optional)

Example:
{
  "title": "Your Paper Title",
  "authors": ["Shivam Mittal", "Coauthor"],
  "venue": "Conference",
  "year": 2025,
  "links": [{ "label": "Paper", "href": "https://arxiv.org/abs/..." }],
  "summary": "One-line abstract or key result."
}

## Deploy on GitHub Pages
This repository will be served at `https://msritian.github.io/research/`. Use the workflow below or enable Pages in Settings.
