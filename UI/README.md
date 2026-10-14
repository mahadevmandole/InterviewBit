# RoundZero UI

The frontend is a Vite + React + TypeScript app. Components follow the `atoms / molecules / organisms / templates` structure, with each component's `.tsx`, `.scss`, and `.test.tsx` colocated in its own folder.

## Run locally

```bash
npm install
npm run dev
```

## Demo sign-in

Authentication is currently a frontend demo until the FastAPI backend is added.

- Email: `test@gmail.com`
- Password: `123`

Other credentials show an inline sign-in error. The demo session uses browser storage; the FastAPI authentication endpoint should replace this mock before production use.

## Checks

```bash
npm test
npm run build
```

The dashboard and question bank are local sample data for this UI step. Answers remain in page state and are not persisted to a backend yet.
