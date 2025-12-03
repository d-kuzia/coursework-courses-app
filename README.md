# Coursework Courses App

Локальний запуск застосунку (бекенд на Express + PostgreSQL, фронтенд на React/Vite).

## Вимоги
- Node.js (рекомендовано LTS 20.x) та npm
- PostgreSQL 14+ із розширенням `pgcrypto`
- Git

## Клонування репозиторію
```bash
git clone <url>
cd coursework-courses-app
```

## Налаштування бази даних
1) Створіть базу та користувача з правами доступу (імена/пароль підставте свої):  
   ```sql
   CREATE DATABASE online_courses;
   ```
2) Увімкніть розширення (разово під суперкористувачем):  
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```
3) Накатіть скрипти у такому порядку:
   ```bash
   psql -d online_courses -f backend/sql/001_init.sql
   psql -d online_courses -f backend/sql/002_user_admin.sql
   psql -d online_courses -f backend/sql/003_seed_courses.sql
   ```

## Файли оточення
Створіть `backend/.env` і заповніть своїми даними:
```env
PORT=5000

DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_courses

JWT_SECRET=long_random_string
JWT_EXPIRES_IN=7d
```

Створіть `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## Встановлення залежностей
- Бекенд:  
  ```bash
  cd backend
  npm install
  ```
- Фронтенд:  
  ```bash
  cd frontend
  npm install
  ```

## Запуск у режимі розробки
1) Переконайтесь, що PostgreSQL запущений.
2) Бекенд (API на `http://localhost:5000`):  
   ```bash
   cd backend
   npm run dev
   ```
3) Фронтенд (Vite на `http://localhost:5173`):  
   ```bash
   cd frontend
   npm run dev
   ```

## Перевірка
- API: `http://localhost:5000/api/health` або `http://localhost:5000/api/dbcheck`
- UI: `http://localhost:5173` (мають відобразитися демо-курси з сидів)

## Корисні команди
- Бекенд: `npm run start` — запуск без nodemon
- Фронтенд: `npm run build` — збірка, `npm run preview` — перегляд збірки
