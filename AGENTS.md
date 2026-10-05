# spm-casting-plan

React + Vite + Tailwind CSS v4 frontend & Django backend project for Forge SPM Casting Plan Optimizer.

## Development Servers

- **Frontend (Vite):** Run `npm run dev` (starts on port 3000)
- **Backend (Django):** Run `python manage.py runserver 8080` (starts on port 8080)

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` - Primary frontend UI component
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 setup
- `index.html` - Vite HTML shell
- `planner/` - Django application for BTR upload, rules, heat sequence, and rolling plan optimization
- `casting_optimizer/` - Django project configuration
- `package.json` - Node dependencies and scripts
- `requirements.txt` - Python backend dependencies
- `vite.config.ts` - Vite configuration with React and Tailwind CSS v4 plugins plus `@` alias for `src`

## Dependencies

- Frontend: React 19, Vite 8, TypeScript 5.7, Tailwind CSS v4 (`@tailwindcss/vite`)
- Backend: Python 3.13, Django 5.2.7, Pandas, OpenPyXL, xlrd

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`.
