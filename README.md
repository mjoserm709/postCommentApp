# PostCommentApp

Aplicacion full-stack para gestion de categorias, posts, comentarios y administracion de acceso con JWT, roles y permisos.

El proyecto esta dividido en:

- `backend`: API REST en NestJS con MongoDB
- `frontend`: cliente Angular standalone
- `docker-compose.yml`: soporte local para MongoDB

## Objetivo del sistema

PostCommentApp permite:

- autenticacion de usuarios con JWT
- control de acceso por roles y permisos
- administracion de usuarios, roles y permisos
- gestion de posts con estados (`draft`, `published`, `archived`)
- comentarios por post
- carga masiva de posts desde `xlsx`, `csv` y `json`
- configuracion runtime del frontend para cambiar el API sin rebuild

## Stack

### Backend

- NestJS 11
- Mongoose
- MongoDB
- Passport JWT
- ConfigModule
- Jest

### Frontend

- Angular 20 standalone
- RxJS
- Signals
- Bootstrap 5
- SweetAlert2
- SheetJS (`xlsx`)

## Arquitectura general

### Backend

El backend esta organizado por modulos:

- `auth`: login, JWT y guards
- `users`: usuarios, cambio de password, desactivacion
- `roles`: gestion de roles
- `permissions`: gestion de permisos
- `posts`: CRUD de posts y carga masiva
- `comments`: comentarios por post
- `common`: filtros, interceptores, middleware y respuestas comunes
- `config`: configuracion y validacion de variables de entorno

### Frontend

El frontend esta organizado por capas:

- `core`: guards, interceptores, configuracion runtime y modelos base
- `features`: auth, admin, users, posts, comments, categories
- `shared`: componentes reutilizables como toasts y modal base

## Funcionalidades principales

### Autenticacion y autorizacion

- Login con JWT
- Persistencia de sesion en frontend
- Guards por autenticacion
- Guards por permisos
- Roles y permisos calculados desde backend

### Gestion administrativa

- Usuarios
  - consultar
  - editar
  - desactivar
- Roles
  - crear
  - editar
  - eliminar
- Permisos
  - crear
  - editar
  - eliminar

### Posts

- crear post manual
- eliminar post
- listar posts paginados
- listar posts publicados por categoria
- importar posts en lote

### Comentarios

- listar comentarios por post
- crear comentarios
- eliminar solo comentarios propios
- polling en frontend para refresco de comentarios

## Configuracion del backend

El backend usa `ConfigModule` y busca variables en este orden:

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
- `CORS_ORIGIN` acepta multiples origenes separados por coma.
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

Plantilla incluida:

`frontend/public/app-config.example.json`

Esto permite cambiar el backend destino sin recompilar Angular.

## Instalacion

Instala dependencias en raiz y en cada aplicacion:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Ejecutar MongoDB

Con Docker:

```bash
docker-compose up mongodb -d
```

## Ejecutar backend

```bash
cd backend
npm run start:dev
```

URLs:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Ejecutar frontend

```bash
cd frontend
npm start
```

URL:

- App: `http://localhost:4200`

## Scripts utiles

### Backend

```bash
cd backend
npm run build
npm run test
```

### Frontend

```bash
cd frontend
npm run build
```

### Raiz

```bash
npm run start:backend
npm run start:frontend
npm run start:all
```

## Carga masiva de posts

La importacion masiva esta disponible desde el panel de posts y acepta:

- `.xlsx`
- `.csv`
- `.json`

### Estructura esperada del JSON

Debe ser un arreglo de objetos:

```json
[
  {
    "title": "Ejemplo de post",
    "slug": "ejemplo-de-post",
    "excerpt": "Resumen corto del post para importacion masiva.",
    "content": "Contenido completo del post. Debe tener una longitud minima valida para pasar la validacion del backend.",
    "categorySlug": "terror",
    "coverImageUrl": "https://ejemplo.com/imagen.jpg",
    "tags": ["cuento", "suspenso"],
    "status": "published",
    "commentsEnabled": true
  }
]
```

### Reglas importantes para importacion

- `title`: minimo 3 caracteres
- `slug`: minusculas, numeros y guiones
- `excerpt`: minimo 10 caracteres
- `content`: minimo 20 caracteres
- `categorySlug`: minusculas, numeros y guiones
- `tags`: arreglo opcional de strings
- `status`: `draft`, `published` o `archived`
- `commentsEnabled`: booleano

## Seguridad y robustez ya implementadas

- `ConfigModule` con validacion de entorno
- JWT obligatorio por configuracion
- CORS configurable
- validacion global con `ValidationPipe`
- filtro global de errores
- respuesta estandarizada
- paginacion validada
- validacion de `ObjectId` en comentarios
- auditoria basica con `createdBy` y `updatedBy`
- logging HTTP con `requestId`

## Cobertura tecnica agregada

Se agregaron pruebas unitarias para modulos criticos:

- auth
- users
- comments
- guards
- roles
- permissions

Actualmente el backend pasa:

- `10` suites
- `28` pruebas

## Endpoints principales

- `POST /auth/login`
- `POST /auth/register`
- `GET /users`
- `PATCH /users/:id`
- `GET /roles`
- `GET /permissions`
- `GET /posts`
- `POST /posts`
- `POST /posts/bulk`
- `GET /comments?postId=<id>`
- `POST /comments`

## Estado actual

- Backend compila correctamente
- Frontend compila correctamente
- Backend con configuracion por ambiente
- Frontend con configuracion runtime del API
- Carga masiva soporta `xlsx`, `csv` y `json`

Pendientes no bloqueantes:

- warning de bundle inicial del frontend
- warning de `sweetalert2` por CommonJS
