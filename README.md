# PaxoraGrid

PaxoraGrid is a federated early-warning and stock redistribution platform for India's Primary Health Centres (PHCs). It brings facility resource reporting, public health monitoring, forecasting, and inter-facility supply coordination into one dashboard.

## Features

- Monitor facility capacity, staffing, and medicine stock.
- Surface public health signals and resource shortfalls.
- Forecast demand and support stock redistribution between facilities.
- Record field updates and coordinate transfers.
- Use Gemini-powered advisory and voice features when an API key is configured.

## Requirements

- Node.js
- npm

## Run Locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Optional: create a `.env` file in the project root and set your Gemini API key to enable Gemini-backed features:

   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ```

   The app can run without this key; Gemini-backed features use their simulated fallback behavior.

3. Start the development server:

   ```sh
   npm run dev
   ```

   Open http://localhost:3000.

## Available Commands

- `npm run dev` starts the development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs the TypeScript check.
