# megatool

20+ free, client-side tools for developers, creators, and businesses — no login, no server uploads, no tracking. Built with vanilla HTML, CSS, and JS.

## Why client-side?

Every tool here runs entirely in your browser. Nothing you type or upload — JSON payloads, resumes, images, invoice data — ever leaves your device. That also means the tools work instantly, with zero signup friction.

## Tool categories

- **💻 Developer & AI Tools** — Webhook/API formatter, prompt optimizer, .env converter, RegEx visualizer
- **📱 Social Media & Creator Tools** — Bio-link generator, YouTube thumbnail extractor, thread splitter, caption spacer
- **💼 Business & Finance Tools (India-specific)** — Invoice generator, tax slab calculator, price estimator, e-commerce margin calculator
- **⚡ Productivity & Student Tools** — Image to WebP/AVIF converter, ATS resume checker, Markdown to PDF converter

## Project structure

```
mega-tool/
├── index.html              # homepage
├── tools/                  # one HTML file per tool, grouped by category
│   ├── dev/
│   ├── social/
│   ├── business/
│   └── productivity/
├── css/
│   └── base.css            # shared design tokens + layout
├── js/
│   ├── core/                # nav.js, theme.js — shared across all pages
│   └── tools/                # one JS file per tool
├── lib/                     # third-party libraries (jsPDF, marked.js)
└── assets/
```

## Local development

No build step required. Just open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
```

## Tech notes

- No frameworks, no bundler — plain HTML/CSS/JS by design.
- `lib/jspdf.min.js` and `lib/marked.min.js` are third-party libraries used by the invoice generator and Markdown converter tools. See their respective tool pages for attribution and license links.
- Dark mode is default; theme preference is stored in `localStorage`.

## Contributing

This project is open source. Issues and PRs welcome.

## License

MIT
