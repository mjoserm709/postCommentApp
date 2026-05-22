# Frontend (Angular Standalone)

Proyecto generado con [Angular CLI](https://github.com/angular/angular-cli) versión 20.3.2 utilizando la arquitectura moderna de **Standalone Components** (sin NgModules).

## Características Implementadas

- **Gestión de Estado Reactivo**: Utilización del ecosistema de **Signals** (`signal()`, `computed()`) para mantener el estado de la aplicación sincronizado, predecible y altamente eficiente.
- **Procesamiento de Archivos (Cliente)**: Implementación de la librería `xlsx` (SheetJS) para leer archivos de Excel, validarlos internamente, transformarlos en JSON y enviarlos al servidor (Carga Masiva).
- **Polling de Comentarios**: Implementación nativa de recarga en tiempo real utilizando funciones asíncronas con `setInterval` acopladas al ciclo de vida del Signal.
- **UI/UX Mejorado**:
  - Alertas dinámicas, de confirmación y modales interactivos a través de `SweetAlert2`.
  - Sistema de comentarios visualmente adaptativo (mensajes del usuario alineados a la derecha, ajenos a la izquierda) simulando un chat moderno con iniciales de avatar automáticas.
  - Sistema de "Toast" Notifications globales para eventos menores.

## Comandos Principales

### Servidor de Desarrollo
Para iniciar el entorno local, corre:
```bash
npm start
```
Abre tu navegador en `http://localhost:4200/`. La aplicación recargará automáticamente ante cualquier cambio de código.

### Compilación para Producción
Para compilar los binarios y empaquetar el frontend:
```bash
npm run build
```
Los archivos optimizados quedarán almacenados en el directorio `dist/`.

### Testing
Para ejecutar las pruebas unitarias nativas (Karma/Jasmine):
```bash
npm test
```
