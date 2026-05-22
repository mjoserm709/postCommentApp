# Frontend

Cliente Angular standalone para PostCommentApp.

La documentacion funcional y de instalacion general esta en el [README de la raiz](../README.md).

## Responsabilidades del frontend

- login y persistencia de sesion
- navegacion segun permisos
- panel administrativo
- listado y detalle de posts
- comentarios por post
- carga masiva de posts
- configuracion runtime del backend destino

## Configuracion runtime

El frontend lee la URL del API desde:

`public/app-config.json`

Ejemplo:

```json
{
  "apiBaseUrl": "http://localhost:3000"
}
```

Esto permite mover el frontend entre ambientes sin recompilar.

## Carga masiva

La pantalla de posts acepta:

- `.xlsx`
- `.csv`
- `.json`

Ejemplo JSON:

```json
[
  {
    "title": "Ejemplo de post",
    "slug": "ejemplo-de-post",
    "excerpt": "Resumen corto del post para importacion masiva.",
    "content": "Contenido completo del post. Debe tener una longitud minima valida.",
    "categorySlug": "terror",
    "tags": ["cuento", "suspenso"],
    "status": "published",
    "commentsEnabled": true
  }
]
```

## Comandos principales

```bash
npm start
npm run build
npm test
```
