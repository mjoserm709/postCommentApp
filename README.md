# postCommentApp

Aplicacion full-stack con `NestJS + MongoDB + Angular standalone` orientada a la prueba tecnica de posts y comentarios. El proyecto incluye autenticacion JWT, respuestas estandarizadas, carga masiva de posts, manejo global de errores y un frontend con Signals, RxJS y formularios reactivos para el flujo principal.

## Stack

- Backend: NestJS 11, Mongoose, MongoDB, JWT, Swagger
- Frontend: Angular 20 standalone, Signals, RxJS, Reactive Forms, Bootstrap
- Infra: Docker y Docker Compose

## Estructura principal

```text
backend/src
├── posts
├── comments
├── auth
├── users
└── common
    ├── filters
    ├── interceptors
    ├── responses
    └── utils

frontend/src/app
├── core
│   ├── interceptors
│   ├── models
│   └── services
├── features
│   ├── posts
│   │   ├── pages
│   │   ├── components
│   │   └── services
│   ├── comments
│   │   ├── components
│   │   └── services
│   └── categories
└── shared
```

## Requisitos

- Node.js 18+
- npm 9+
- Docker Desktop o una instancia local de MongoDB

## Variables de entorno

El backend usa estas variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/library
JWT_SECRET=super-secret-key
```

Si no defines `MONGO_URI`, el backend usa `mongodb://localhost:27017/library`.

## Instalacion

### 1. Instalar dependencias

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Levantar MongoDB

Con Docker:

```bash
docker-compose up mongodb -d
```

### 3. Ejecutar backend

```bash
cd backend
npm run start:dev
```

Backend disponible en `http://localhost:3000`

Swagger disponible en `http://localhost:3000/api/docs`

### 4. Ejecutar frontend

```bash
cd frontend
npm start
```

Frontend disponible en `http://localhost:4200`

## Scripts utiles

### Raiz

```bash
npm run start:all
```

### Backend

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

### Frontend

```bash
npm start
npm run build
npm test
```

## Autenticacion

El proyecto usa JWT. El `AuthInterceptor` agrega el token a las peticiones autenticadas y el `errorInterceptor` centraliza errores HTTP para mostrar mensajes uniformes en UI.

## Respuesta estandar de API

Respuestas exitosas:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Respuestas con error:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "Bad Request",
    "details": {}
  }
}
```

## Endpoints principales

### Auth

- `POST /auth/login`
- `POST /auth/register`

### Posts

- `GET /posts`
- `GET /posts/:id`
- `POST /posts`
- `PUT /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/bulk`
- `GET /posts/category/:categorySlug`

### Comments

- `GET /comments?postId=<id>`
- `POST /comments`
- `DELETE /comments/:id`

Compatibilidad adicional:

- `GET /posts/:postId/comments`
- `POST /posts/:postId/comments`

## Bulk insert

El endpoint `POST /posts/bulk` usa `insertMany()` y valida:

- arreglo minimo de posts
- duplicados dentro del lote
- slugs ya existentes en base de datos

Respuesta esperada:

```json
{
  "success": true,
  "message": "Created",
  "data": {
    "importId": "lote-mayo-2026",
    "count": 3,
    "posts": []
  }
}
```

## Flujo principal en frontend

- `admin/posts`: listado administrativo, busqueda, creacion y carga masiva
- `categories/:slug`: listado publico por categoria
- modal de comentarios con listado y formulario reactivo
- formulario reactivo de post con validaciones
- estado manejado con Signals y filtros con `computed`
- RxJS con `switchMap`, `tap`, `catchError`, `delay` y `retry`

## Verificacion realizada

- `backend`: `npm run build`
- `frontend`: `npm run build`

## Pendientes recomendados

- ampliar cobertura automatizada de posts/comments
- agregar coleccion Postman exportada
- adjuntar screenshots del flujo principal
