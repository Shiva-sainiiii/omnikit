# Omnikit

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
Omnikit/
├── index.html                      # homepage — grid of all tools
├── /tools/
│   ├── /dev/
│   │   ├── webhook-formatter.html
│   │   ├── prompt-optimizer.html
│   │   ├── env-to-json.html
│   │   └── regex-visualizer.html
│   ├── /social/
│   │   ├── bio-link-generator.html
│   │   ├── youtube-thumbnail-extractor.html
│   │   ├── thread-splitter.html
│   │   └── instagram-caption-spacer.html
│   ├── /business/
│   │   ├── invoice-generator.html
│   │   ├── tax-slab-calculator.html
│   │   ├── price-estimator.html
│   │   └── ecommerce-margin-calculator.html
│   └── /productivity/
│       ├── image-converter.html
│       ├── resume-ats-checker.html
│       └── markdown-to-pdf.html
│
├── /css/
│   ├── base.css                    # shared: reset, typography, colors
│   └── /tools/                     # tool-specific overrides (only if needed)
│
├── /js/
│   ├── /core/
│   │   ├── nav.js                  # shared header/footer logic
│   │   └── theme.js                # dark mode toggle etc (if any)
│   └── /tools/
│       ├── webhook-formatter.js
│       ├── prompt-optimizer.js
│       ├── env-to-json.js
│       ├── regex-visualizer.js
│       ├── bio-link-generator.js
│       ├── youtube-thumbnail.js
│       ├── thread-splitter.js
│       ├── caption-spacer.js
│       ├── invoice-generator.js
│       ├── tax-calculator.js
│       ├── price-estimator.js
│       ├── margin-calculator.js
│       ├── image-converter.js
│       ├── ats-checker.js
│       └── markdown-to-pdf.js
│
├── /lib/                           # third-party libs (jspdf, marked.js, etc)
│   ├── jspdf.min.js
│   └── marked.min.js
│
├── /assets/
│   ├── icons/                      # ek icon per tool for homepage cards
│   └── og-images/                  # social share preview images
│
├── README.md
└── .gitignore
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
