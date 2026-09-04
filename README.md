# Tool Hub

An all-in-one, fully client-side toolkit with **31 active tools across 10 categories**. Every operation runs directly in the browser — no backend, no database, no accounts, no data ever leaves your machine.

## Features

- **31 fully functional tools** — no placeholders, no "coming soon"
- **100% client-side processing** — files never leave the browser
- **Dark / light mode** with localStorage persistence
- **Fuzzy search** with `Ctrl+K` / `⌘K` shortcut
- **Favorites** — pin tools with a star, persisted in localStorage
- **Recently used** — auto-tracks your last 4 tools
- **Responsive** — mobile, tablet, and desktop layouts
- **Zero database** — deploy anywhere as static files

## Tools

| Category | Tools |
|---|---|
| **PDF & Document** | Merge PDF, Split PDF, Compress PDF, PDF to Image |
| **Document Scanner** | Document Scanner (camera capture, Magic Color / B&W / Grayscale filters), Image to Text (OCR) |
| **Image & Photo** | Image Compressor, Image Resizer, Image Format Converter |
| **Text & Productivity** | Word Counter, Text Case Converter |
| **Daily Utilities** | QR Code Generator & Scanner, Password Generator |
| **Media Tools** | Video Downloader (URL analyzer), Audio Extractor |
| **Calculators** | Age Calculator, Percentage Calculator, Unit Converter, BMI Calculator |
| **Developer Tools** | JSON Formatter, Base64 Encoder/Decoder, Markdown Previewer, Hash Generator (SHA-256 + MD5) |
| **Content Creator** | Text Diff Checker, Lorem Ipsum Generator |
| **Network & Utilities** | Device & Browser Info, MAC Address Lookup, Subnet/CIDR Calculator, UUID Generator, URL Encoder/Decoder, Password Strength Meter |

## Tech Stack

- [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org)
- [React 19](https://react.dev) + [React Router v7](https://reactrouter.com)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://motion.dev) for animations
- [pdf-lib](https://github.com/Hopding/pdf-lib) for PDF processing
- [Tesseract.js](https://tesseract.projectnaptha.com) for OCR
- [qrcode](https://github.com/soldair/node-qrcode) + [jsQR](https://github.com/cozmo/jsQR) for QR codes
- [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify) for Markdown

## Getting Started

Requires [Node.js](https://nodejs.org) 18+ (or [Bun](https://bun.sh)).

```bash
# Install dependencies
npm install        # or: bun install

# Start the dev server
npm run dev        # or: bun run dev

# Build for production
npm run build      # or: bun run build

# Preview the production build
npm run preview
```

No environment variables, API keys, accounts, or external services are required. The app is fully self-contained.

## Deployment

The production build is a static site in `dist/` — deployable to any static host:

### Vercel
1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Vite** (build command `npm run build`, output directory `dist`)
3. Deploy

Or with the CLI:
```bash
npx vercel --prod
```

### Netlify
1. Import the repository at [app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build` · Publish directory: `dist`
3. Add a SPA redirect (create `public/_redirects` containing `/* /index.html 200`)

Or with the CLI:
```bash
npx netlify deploy --prod --dir=dist
```

### Any VPS / static server
```bash
npm run build
# Serve the dist/ folder with any static file server, e.g.:
npx serve dist
```

## Project Structure

```
src/
├── main.tsx                    # App entry, routes
├── index.css                   # Theme tokens (oklch), Tailwind
├── lib/
│   └── tool-registry.ts        # Modular tool + category registry
├── pages/
│   ├── Landing.tsx             # Public landing page
│   ├── Dashboard.tsx           # Tool hub (sidebar, grid, tool views)
│   └── NotFound.tsx            # 404
├── components/
│   ├── tools/                  # One component per tool
│   ├── SearchDialog.tsx        # Ctrl+K fuzzy search
│   ├── ThemeToggle.tsx         # Dark/light switch
│   └── ui/                     # shadcn/ui primitives
└── hooks/
    ├── use-theme.ts            # Theme with localStorage
    ├── use-favorites.ts        # Pinned tools
    └── use-recent.ts           # Recently used tools
```

## Adding a New Tool

The architecture is modular — new tools need two additions:

1. **Register it** in `src/lib/tool-registry.ts`:
```ts
{
  id: "my-tool",
  name: "My Tool",
  description: "What it does.",
  icon: "Sparkles",          // Lucide icon name
  category: "utility",       // existing category id
  routeKey: "my-tool",
}
```

2. **Wire it up** in `src/pages/Dashboard.tsx`:
   - Add a lazy import: `const MyTool = lazy(() => import("@/components/tools/MyTool"));`
   - Add `"my-tool": MyTool` to the `toolComponents` map
   - Add the icon to `iconMap` if it's not already there
   - Create the component in `src/components/tools/`

That's it — the tool automatically appears in the sidebar, search, category grid, and favorites.

## Privacy

All processing happens locally in your browser. Files are never uploaded, no analytics are collected, and nothing is stored on any server. Your preferences (theme, favorites, recents) live only in your browser's localStorage.
