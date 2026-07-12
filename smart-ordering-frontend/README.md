# Smart Ordering Frontend

This frontend is a Next.js application for the TaybleTap ordering system.
It connects to the Django backend in `smart-ordering-backend/` and provides the user interface for customers and admins.

## Project structure

- `app/` contains Next.js route pages and page-specific UI.
- `components/` reusable React components used across the app.
- `context/` application context providers, including authentication state.
- `lib/` helper utilities and backend API wrapper functions.
- `public/` static assets.

## Setup

Install dependencies and start the development server:

```bash
cd smart-ordering-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

You can start editing the page by modifying `app/page.tsx`. The page updates automatically as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the [Geist](https://vercel.com/font) font family for Vercel.

## Available scripts

- `npm run dev` - start the frontend in development mode.
- `npm run build` - build the production application.
- `npm run start` - run the built production application.
- `npm run lint` - run ESLint to verify code style and quality.

## Backend integration

The frontend communicates with the backend API through utility functions in `lib/api.ts`.
Ensure the Django backend is running before using frontend features that fetch or submit data.

## Notes

- This README focuses on frontend setup and structure.
- See the root `README.md` for the overall repository overview and backend setup instructions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
