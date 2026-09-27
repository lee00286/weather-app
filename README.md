# Weather App

A weather web application with real-time forecasts, weather alerts, and historical trends.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Charts:** Recharts 2.15+
- **Data Fetching:** TanStack Query v5
- **Timezone:** Luxon
- **Testing:** Jest, React Testing Library, MSW

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root with `.env.example` as a template.

3. Start the development server:

```bash
npm run dev
```

## Third-Party APIs and Attribution

This application uses two external weather APIs:

### Open-Meteo

- **Purpose:** Weather forecast data (current, hourly, daily) and historical weather archives
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Attribution required:** Yes
- **Website:** [https://open-meteo.com/](https://open-meteo.com/)

Weather data provided by Open-Meteo. Open-Meteo offers free weather forecast APIs for non-commercial use with no API key required.

### WeatherAPI.com

- **Purpose:** Location search/autocomplete and weather alerts
- **License:** Free tier with mandatory attribution
- **Attribution required:** Yes
- **Website:** [https://www.weatherapi.com/](https://www.weatherapi.com/)

Location search and weather alerts powered by WeatherAPI.com.

## Rate Limiting

Both upstream APIs are free-tier with daily quotas (Open-Meteo ~10k/day, WeatherAPI.com ~33k/day). To keep a single client from burning through those quotas, abuse protection is handled at the hosting layer instead of in application code:

- **CDN cache headers** on every `/api/*` route (`s-maxage` 5 min – 24 hr) absorb repeat requests for the same parameters at Vercel's edge before they reach the upstream APIs.
- **Vercel Firewall** enforces a per-IP request cap on `/api/*`. Configured in the Vercel dashboard under **Project → Settings → Firewall → Rate Limiting**. Current rule: path `/api/*`, 30 requests/minute/IP, action: deny (429).

This keeps the codebase free of rate-limit middleware and external dependencies (Redis, etc.) while still protecting the upstream quotas. If quota exhaustion ever becomes a real problem, switch to per-IP middleware backed by Upstash Redis.

## License

This project is for personal/educational use.

Weather data is provided by [Open-Meteo](https://open-meteo.com/) under CC BY 4.0. Location search and alerts are provided by [WeatherAPI.com](https://www.weatherapi.com/). Both services require attribution when used in public-facing applications.
