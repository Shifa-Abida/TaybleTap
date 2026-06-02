# TaybleTap

TaybleTap is a restaurant ordering application with a Django backend and a Next.js frontend.

## Repository structure

- `smart-ordering-backend/`
  - Django application and API backend
  - `manage.py` for administrative and development commands
  - `requirements.txt` for Python dependencies
  - `db.sqlite3` local development database
- `smart-ordering-frontend/`
  - Next.js frontend application
  - `package.json` and `package-lock.json` for frontend dependencies
  - `app/` contains page routes and React components
  - `components/` reusable UI components
  - `context/` application context providers and authentication flow
  - `lib/` API utilities for communicating with the backend

## Setup

### Backend

1. Create and activate a Python virtual environment.
2. Install backend dependencies from `smart-ordering-backend/requirements.txt`.
3. Run Django migrations and start the development server.

Example:

```bash
cd smart-ordering-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

1. Change to the frontend directory.
2. Install dependencies.
3. Start the Next.js development server.

Example:

```bash
cd smart-ordering-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` by default.

## Notes

- The backend is a Django application and the frontend is built with Next.js.
- The repository includes separate backend and frontend directories to keep services organized.
- No production deployment instructions are included in this repository; the focus is on local development.

## Related documentation

- See `smart-ordering-frontend/README.md` for frontend-specific instructions.
