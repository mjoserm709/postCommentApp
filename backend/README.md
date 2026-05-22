# Backend (NestJS)

La documentación principal y detallada de todo el proyecto vive en el [`README.md`](../README.md) de la raíz.

## Puntos relevantes y funcionalidades del backend:

- **Framework & DB**: NestJS + Mongoose (MongoDB).
- **Seguridad**: Autenticación mediante JWT y protección de rutas con Decoradores de Permisos.
- **Manejo de Respuestas**:
  - `ValidationPipe` global para validar los Data Transfer Objects (DTOs).
  - `GlobalExceptionFilter` para capturar errores y retornar un formato JSON unificado.
  - `ResponseInterceptor` para formatear los casos de éxito estandarizados (`{ success, data, message }`).
- **Paginación Real**: Integrada en los servicios (ej. `PostsService` y `CategoriesService`) utilizando `.skip()` y `.limit()` nativos de MongoDB para alto rendimiento.
- **Carga Masiva**: Endpoint `POST /posts/bulk` optimizado con `insertMany()`.
- **Testing**: Pruebas unitarias configuradas con **Jest**, usando Mocks y el módulo de Testing de NestJS para no depender de una conexión a base de datos.
  - Para ejecutar pruebas: `npm run test`
