# PostCommentApp

Aplicacion full-stack con `NestJS + MongoDB + Angular standalone` para categorias, posts, comentarios y administracion de acceso con JWT, roles y permisos.

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
|- roles
|- permissions
|- users
|- common
|- config

frontend/src/app
|- core
|- features
|- shared
```

## Requisitos

- Node.js 20+ recomendado
- npm 10+ recomendado
- Docker Desktop o una instancia local de MongoDB

## Configuracion del backend

El backend usa `ConfigModule` y carga variables por ambiente en este orden:

1. `.env.<NODE_ENV>.local`
2. `.env.<NODE_ENV>`
3. `.env.local`
4. `.env`

Archivos incluidos:

- `backend/.env`
- `backend/.env.example`
- `backend/.env.development`
- `backend/.env.production.example`

Variables requeridas:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/postcommentapp
JWT_SECRET=change_this_to_a_long_random_secret
CORS_ORIGIN=http://localhost:4200
JWT_EXPIRES_IN=1d
```

Notas:

- `JWT_SECRET` debe ser una clave privada y larga.
- `CORS_ORIGIN` acepta varios origenes separados por coma.
- El backend valida estas variables al iniciar.

## Configuracion del frontend

El frontend usa configuracion runtime desde:

`frontend/public/app-config.json`

Ejemplo:

```json
{
  "apiBaseUrl": "http://localhost:3000"
}
```

Tambien tienes una plantilla en:

`frontend/public/app-config.example.json`

Esto permite cambiar la URL del API sin recompilar Angular.

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

## Cobertura tecnica agregada

Se reforzo la base tecnica con:

- `ConfigModule` y validacion de variables de entorno
- configuracion runtime del frontend
- validaciones mas estrictas en paginacion y posts
- auditoria basica de `createdBy` y `updatedBy` en users, roles y permissions
- logging HTTP con `requestId`
- pruebas unitarias en auth, users, comments, guards, roles y permissions

## Endpoints principales

- `POST /auth/login`
- `POST /auth/register`
- `GET /posts`
- `POST /posts`
- `POST /posts/bulk`
- `GET /comments?postId=<id>`
- `POST /comments`

## Estado actual

- Backend compila correctamente
- Frontend compila correctamente
- El frontend puede apuntar a otro API sin rebuild
- Quedan advertencias no bloqueantes por tamano de bundle y por `sweetalert2` en CommonJS
