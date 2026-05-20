# postCommentApp — NestJS + Angular + MongoDB

Aplicación full-stack para gestión de usuarios y autenticación, construida con **Angular 19 (Standalone + Signals)** en el frontend y **NestJS** en el backend, conectado a **MongoDB** mediante Mongoose.

---

## 🏗️ Arquitectura del Proyecto

```
postCommentApp/
├── backend/          # API REST con NestJS
│   └── src/
│       ├── auth/     # Módulo de autenticación (login, registro, JWT)
│       ├── users/    # Módulo de usuarios (CRUD)
│       ├── common/   # Filtros, interceptors y utilidades globales
│       └── seed/     # Seeder inicial (crea el Super Admin)
│
├── frontend/         # SPA con Angular 19
│   └── src/app/
│       ├── core/     # Interceptors (JWT)
│       └── features/
│           ├── auth/   # Login y Registro
│           └── users/  # Lista de usuarios
│
├── docker-compose.yml
└── package.json      # Scripts para ejecutar ambos entornos
```

---

## ⚙️ Requisitos Previos

- **Node.js** v18+ y **npm**
- **Docker** y **Docker Desktop** (con WSL2 habilitado en Windows)

> **⚠️ PCs con 8GB de RAM:** Docker puede consumir toda la memoria al usar WSL2.
> Crea o edita el archivo `C:\Users\tu_usuario\.wslconfig` con:
> ```ini
> [wsl2]
> memory=3GB
> ```
> Reinicia tu PC o Docker después de aplicarlo.

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1 — Ambos entornos a la vez (Recomendado para desarrollo)

Desde la raíz del proyecto, con MongoDB ya corriendo en Docker:

```bash
# 1. Levanta MongoDB
docker-compose up mongodb -d

# 2. Instala dependencias raíz (solo la primera vez)
npm install

# 3. Inicia backend y frontend simultáneamente
npm run start:all
```

| Servicio  | URL                        |
|-----------|----------------------------|
| Backend   | http://localhost:3000      |
| Swagger   | http://localhost:3000/api/docs |
| Frontend  | http://localhost:4200      |

---

### Opción 2 — Individualmente

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

### Opción 3 — Con Docker Completo

```bash
docker-compose up --build
```

Levanta 2 contenedores:
- `mongodb`: Base de datos en el puerto `27017`
- `backend`: API NestJS en el puerto `3000`

Para detener: `Ctrl + C` y luego `docker-compose down`

---

## 🔐 Credenciales por Defecto

Al iniciar el backend por primera vez, el **Seeder** crea automáticamente un Super Admin:

| Campo    | Valor              |
|----------|--------------------|
| Usuario  | `admin`            |
| Password | `admin123`         |
| Rol      | `SUPER_ADMIN`      |

---

## 📡 Endpoints Disponibles

### Auth — `/auth`

| Método | Ruta             | Descripción              | Auth |
|--------|------------------|--------------------------|------|
| POST   | `/auth/login`    | Iniciar sesión (JWT)     | ❌   |
| POST   | `/auth/register` | Registrar nuevo usuario  | ❌   |

### Users — `/users`

| Método | Ruta          | Descripción              | Auth |
|--------|---------------|--------------------------|------|
| GET    | `/users`      | Listar todos los usuarios | ✅  |
| GET    | `/users/:id`  | Obtener usuario por ID   | ✅   |
| PATCH  | `/users/:id`  | Actualizar usuario       | ✅   |
| DELETE | `/users/:id`  | Eliminar usuario (soft)  | ✅   |

> La documentación completa e interactiva está en **Swagger**: `http://localhost:3000/api/docs`

---

## 🧱 Stack Tecnológico

| Capa       | Tecnología                            |
|------------|---------------------------------------|
| Frontend   | Angular 19, Standalone Components, Signals, ng-bootstrap |
| Backend    | NestJS, Passport.js, JWT              |
| Base de datos | MongoDB, Mongoose                 |
| Validación | class-validator, class-transformer    |
| Docs API   | Swagger / OpenAPI                     |
| Contenedores | Docker, Docker Compose             |
