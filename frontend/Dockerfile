# Stage 1: Build Vite React App
FROM node:18-alpine as build

WORKDIR /app

# Copy package config
COPY package*.json ./

# Install all dependencies (includes devDependencies for building)
RUN npm install

# Copy source
COPY . .

# Build the app bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:stable-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
