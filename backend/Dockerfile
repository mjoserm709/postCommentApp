# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# Exponemos el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
