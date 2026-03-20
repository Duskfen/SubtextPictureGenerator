# Subtext Picture Generator

Generates standardized social media images (1080x1920) from [subtext.at](https://www.subtext.at) article URLs. Built for the editorial team to quickly create consistent Instagram/story visuals.

## Architecture

```
Frontend/                    Next.js 15 (App Router, TypeScript)
Backend/                     Azure Functions v4 (.NET 8, isolated worker)
```

**Frontend** renders a live preview of the article (headline, author, image, tags) and lets users customize colors and text sizes before exporting as PNG, JPEG, or SVG.

**Backend** exposes two endpoints:
- `GET /api/scrape?url=<article-url>` — scrapes article data (title, author, image, categories) from a subtext.at page using HtmlAgilityPack
- `GET /api/recent` — returns the 10 most recent articles from the subtext.at RSS feed

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)

### Backend

```bash
cd Backend/SubtextPictureGenerator
dotnet restore
func start
```

Runs on `http://localhost:7071`.

### Frontend

```bash
cd Frontend/subtext_picture_generator
npm install
npm run dev
```

Runs on `http://localhost:3000`. The frontend expects the backend at the URL configured in `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:7071/api/scrape
```

## Deployment

- **Frontend** — deployed to Vercel, auto-deploys on push to `main`
- **Backend** — deployed to Azure Functions:
  ```bash
  cd Backend/SubtextPictureGenerator
  func azure functionapp publish SubtextScraper --dotnet-isolated
  ```

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 15, React 18, TypeScript 5, SCSS        |
| Backend  | .NET 8, Azure Functions (isolated), HtmlAgilityPack |
| Export   | html2canvas (PNG/JPEG), html-to-image (SVG)     |
| Hosting  | Vercel (frontend), Azure Functions (backend)    |
