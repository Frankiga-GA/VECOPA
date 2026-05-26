# Vecopa

Vecopa es una plataforma web responsive para HORECA orientada a celulares, tablets y escritorio. El MVP incluye frontend React/Vite y backend NestJS con Prisma/PostgreSQL.

## Estructura

- `apps/web`: React, Vite, TypeScript, TailwindCSS, Zustand.
- `apps/api`: NestJS, Prisma ORM, PostgreSQL, JWT.

## Inicio rapido

```bash
npm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env
npm run prisma:generate
npm run seed
npm run dev:web
npm run dev:api
```

Firebase:

- El frontend usa Firebase Auth y Firestore con el proyecto `vecopa-14fec`.
- Activa Email/Password en Authentication.
- Publica reglas similares a `firestore.rules`.
- Al iniciar sesion por primera vez, si Firestore esta vacio, Vecopa crea datos operativos iniciales.

Usuarios sugeridos:

- `admin@vecopa.pe` / `Admin123!`
- `caja@vecopa.pe` / `Caja123!`
- `mozo@vecopa.pe` / `Mozo123!`

El backend Nest acepta tokens reales de Firebase Auth en el header:

```txt
Authorization: Bearer <firebase-id-token>
```
