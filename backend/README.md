# Backend

La documentacion principal del proyecto vive en el [README de la raiz](../README.md).

## Resumen tecnico

El backend esta construido con NestJS, Mongoose y MongoDB, y cubre:

- autenticacion JWT
- autorizacion por roles y permisos
- CRUD administrativo de usuarios, roles y permisos
- posts con estados y carga masiva
- comentarios por post
- respuestas y errores estandarizados
- configuracion por ambiente con `ConfigModule`
- logging HTTP con `requestId`
- auditoria basica de cambios administrativos

## Configuracion

El backend usa variables de entorno cargadas por `ConfigModule`.

Archivos recomendados:

- `.env`
- `.env.development`
- `.env.production.example`

Variables clave:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/postcommentapp
JWT_SECRET=change_this_to_a_long_random_secret
CORS_ORIGIN=http://localhost:4200
JWT_EXPIRES_IN=1d
```

## Comandos principales

```bash
npm run start:dev
npm run build
npm run test
```

## Testing

La base incluye pruebas unitarias en:

- auth
- users
- comments
- guards
- roles
- permissions
