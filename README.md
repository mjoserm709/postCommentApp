# PostCommentApp

Aplicacion full-stack con `NestJS + MongoDB + Angular standalone` para gestion de categorias, posts, comentarios y administracion de acceso con JWT, roles y permisos.

## Stack

- Backend: NestJS 11, Mongoose, MongoDB, JWT, Passport, Jest
- Frontend: Angular 20 standalone, RxJS, Signals, Bootstrap 5, SweetAlert2, XLSX
- Infraestructura: Docker Compose para MongoDB

## Estructura

```text
backend/src
|- auth
|- comments
|- posts
|- users
|- common

frontend/src/app
|- core
|- features
|- shared
```

## Requisitos

- Node.js 20+ recomendado
- npm 10+ recomendado
- Docker Desktop o una instancia local de MongoDB

## Variables de entorno

El backend usa un archivo local en `backend/.env`.

Puedes crearlo a partir de:

```bash
cp backend/.env.example backend/.env
```

Variables requeridas:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/postcommentapp
JWT_SECRET=change_this_to_a_long_random_secret
CORS_ORIGIN=http://localhost:4200
```

Notas:

- `JWT_SECRET` debe ser una clave larga y privada.
- `CORS_ORIGIN` puede recibir varios orígenes separados por coma.
  Ejemplo: `http://localhost:4200,http://127.0.0.1:4200`
- El backend ahora exige `JWT_SECRET` y `CORS_ORIGIN` para iniciar.

## Instalacion

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Ejecutar MongoDB

```bash
docker-compose up mongodb -d
```

## Ejecutar backend

```bash
cd backend
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Ejecutar frontend

```bash
cd frontend
npm start
```

- App: `http://localhost:4200`

## Scripts utiles

Backend:

```bash
cd backend
npm run build
npm run test
```

Frontend:

```bash
cd frontend
npm run build
```

Raiz:

```bash
npm run start:backend
npm run start:frontend
npm run start:all
```

## Endpoints principales

- `POST /auth/login`
- `POST /auth/register`
- `GET /posts`
- `POST /posts`
- `POST /posts/bulk`
- `GET /comments?postId=<id>`
- `POST /comments`

## Estado actual

- Backend compila correctamente con variables de entorno obligatorias.
- Frontend compila correctamente.
- Quedan advertencias no bloqueantes por tamano de bundle y por el paquete `sweetalert2` en formato CommonJS.
