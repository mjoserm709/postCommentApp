# PostCommentApp

Aplicación full-stack con `NestJS + MongoDB + Angular standalone` orientada a un flujo dinámico de posts y comentarios. El proyecto incluye autenticación JWT, respuestas estandarizadas, paginación real de base de datos, carga masiva de posts desde Excel, manejo global de errores y un frontend interactivo con Signals, RxJS, Polling en vivo y formularios reactivos.

## 🚀 Novedades de la última versión
- **Paginación Real**: Implementada nativamente en Mongoose para optimizar el rendimiento y evitar transferencias masivas de datos en la red.
- **Carga Masiva con Excel**: Importación en bloque (Bulk) subiendo un archivo `.xlsx`. El cliente procesa el Excel mediante SheetJS y envía la data optimizada al backend.
- **Comentarios en Vivo (Polling)**: Angular Signals combinados con `setInterval` para recargar comentarios en la pantalla de forma transparente sin que el usuario recargue la página.
- **UI Moderna**: Listados de comentarios estilo "chat" (alineados a derecha e izquierda) con avatares dinámicos basados en iniciales. Notificaciones y confirmaciones mejoradas con `SweetAlert2`.
- **Colección Postman**: Incluida en la raíz del proyecto para pruebas automáticas de la API de principio a fin.
- **Pruebas Unitarias**: Entorno Jest configurado en el backend con simulaciones (Mocking) de base de datos.

## 💻 Stack Tecnológico

- **Backend**: NestJS 11, Mongoose, MongoDB, JWT, Passport, Jest.
- **Frontend**: Angular 20 standalone, Signals, RxJS, Reactive Forms, Bootstrap 5, SweetAlert2, XLSX (SheetJS).
- **Infraestructura**: Docker y Docker Compose para la base de datos.

## 📂 Estructura Principal

```text
backend/src
├── posts       # Lógica CRUD, carga masiva y pruebas (posts.service.spec.ts)
├── comments    # Manejo de comentarios paginados por Post
├── auth        # Autenticación, JWT, Login y Registro
├── users       # Gestión de roles y usuarios
└── common      # Filtros, Interceptores y utilidades globales

frontend/src/app
├── core        # Interceptores de Auth, modelos y servicios base
├── features
│   ├── posts   # Listado general, modal de creación, carga masiva (Excel)
│   ├── comments# Interfaz de mensajería asíncrona, recarga en vivo
│   └── categories
└── shared      # Pipes y notificaciones globales
```

## ⚙️ Requisitos

- Node.js 18+
- npm 9+
- Docker Desktop o una instancia local de MongoDB

## 🔧 Variables de Entorno

El backend usa estas variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/library
JWT_SECRET=super-secret-key
```

Si no defines `MONGO_URI`, el backend usa `mongodb://localhost:27017/library`.

## 📦 Instalación y Ejecución

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
- API disponible en `http://localhost:3000`
- Swagger disponible en `http://localhost:3000/api/docs`

### 4. Ejecutar frontend

```bash
cd frontend
npm start
```
- Interfaz disponible en `http://localhost:4200`

## 🧪 Pruebas Unitarias (Backend)

Se implementaron pruebas automatizadas con Jest usando Mocks para aislar la base de datos:

```bash
cd backend
npm run test
```

## 📚 API y Postman

El proyecto incluye el archivo `PostCommentApp-Collection.json` en la raíz. Solo tienes que importarlo en **Postman** para acceder a 17 endpoints pre-configurados con variables dinámicas de entorno y scripts de aserciones (`Tests`).

### Endpoints principales
- **Auth**: `POST /auth/login`, `POST /auth/register`
- **Posts**: `GET /posts` (paginado), `POST /posts`, `POST /posts/bulk`, etc.
- **Comments**: `GET /comments?postId=<id>` (paginado), `POST /comments`.

## 📥 Carga Masiva (Bulk Insert)

El endpoint `POST /posts/bulk` usa `insertMany()` y valida:
- Arreglo mínimo de posts.
- Duplicados dentro del lote (Excel).
- Slugs ya existentes en base de datos.

En el frontend, el usuario puede descargar una **plantilla `.xlsx`**, llenarla y subirla. El navegador procesará las filas y las convertirá en los datos que el backend necesita.
