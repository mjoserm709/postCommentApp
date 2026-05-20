# LibraryApp (NestJS + Angular + MongoDB)

Este proyecto contiene un frontend en Angular (Standalone) y un backend en NestJS conectado a MongoDB.

## Requisitos Previos
- Node.js y npm instalados
- Docker y Docker Desktop instalados (y configurados con WSL2 en Windows)

> **⚠️ IMPORTANTE PARA PCs CON 8GB DE RAM:**
> Docker usa WSL2, lo cual puede consumir toda tu memoria RAM. Se ha incluido una instrucción para limitar la RAM a 3GB.
> Abre una terminal y verifica que tienes un archivo en `C:\Users\tu_usuario\.wslconfig` con este contenido:
> ```ini
> [wsl2]
> memory=3GB
> ```
> Si no lo tienes, créalo y reinicia tu PC o Docker.

## Instrucciones para Ejecutar con Docker (Para la prueba)

En la raíz del proyecto, abre una terminal y ejecuta:

```bash
docker-compose up --build
```

Esto levantará 2 contenedores:
1. `library_mongodb`: La base de datos corriendo en el puerto 27017.
2. `library_backend`: El servidor NestJS corriendo en el puerto 3000.

*Nota: Para detenerlos, presiona `Ctrl + C` y luego corre `docker-compose down`.*

## Instrucciones para Ejecutar Localmente (Desarrollo sin Docker)

Si quieres programar sin que Docker ralentice tu PC:

**1. Base de datos:** 
Levanta solo el contenedor de MongoDB con:
```bash
docker-compose up mongodb -d
```

**2. Backend:**
Abre una terminal, entra a la carpeta `backend` y ejecuta:
```bash
cd backend
npm install
npm run start:dev
```

**3. Frontend:**
Abre otra terminal, entra a la carpeta `frontend` y ejecuta:
```bash
cd frontend
npm install
npm start
```
El frontend estará disponible en `http://localhost:4209` (o el puerto que Angular asigne).
