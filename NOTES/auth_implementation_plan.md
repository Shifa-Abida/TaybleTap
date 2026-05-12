# TaybleTap Authentication — Implementation Plan

## Overview
Build working Login & Register pages with a Django + MongoDB backend.

## Scope

### Frontend (Next.js)
| Task | File | Status |
|------|------|--------|
| Create Login page | `app/login/page.tsx` | ⬜ |
| Create Register page | `app/register/page.tsx` | ⬜ |
| Wire Navbar buttons to routes | `app/page.tsx` (Navbar) | ⬜ |
| Add API utility for auth calls | `lib/api.ts` | ⬜ |

### Backend (Django + MongoDB)
| Task | File/Dir | Status |
|------|----------|--------|
| Initialize Django project | `smart-ordering-backend/` | ⬜ |
| Install deps (DRF, pymongo, JWT, CORS) | `requirements.txt` | ⬜ |
| Configure MongoDB connection | `settings.py` | ⬜ |
| Create auth endpoints (register/login) | `accounts/views.py` | ⬜ |
| Set up CORS for frontend | `settings.py` | ⬜ |

### Integration & Git
| Task | Status |
|------|--------|
| Connect frontend forms → backend API | ⬜ |
| Test full login/register flow | ⬜ |
| Commit & push as new feature | ⬜ |

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Backend**: Django 5, Django REST Framework
- **Database**: MongoDB (via `pymongo`)
- **Auth**: JWT tokens (`PyJWT`)
- **CORS**: `django-cors-headers`

## API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/register/` | Create new restaurant account |
| `POST` | `/api/auth/login/` | Login & receive JWT token |
| `GET` | `/api/auth/me/` | Get current user profile |
