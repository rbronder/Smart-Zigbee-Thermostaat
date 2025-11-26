# STAGE 1: BUILD (De Node.js omgeving voor Vite)
FROM node:20-alpine as builder

# Stel de werkmap in de container in
WORKDIR /app

# Kopieer package.json. Vite gebruikt 'npm run build'
COPY package.json .

# Installeer de afhankelijkheden
RUN npm install

# Kopieer de rest van de projectbestanden
COPY . .

# Optioneel, maar goed voor schone builds in Docker
ENV CI=true 

# Voer de build uit. Vite maakt de map /app/dist aan!
RUN npm run build

# --- STAGE 2: RUN (De Lichte Nginx Webserver) ---
FROM nginx:alpine

# Verwijder de standaard Nginx-configuratie
RUN rm /etc/nginx/conf.d/default.conf

# PAS HIER HET PAD AAN VAN /app/build NAAR /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Maak een simpele Nginx configuratie voor een Single Page Application (SPA).
RUN echo "server { \
  listen 80; \
  location / { \
  root /usr/share/nginx/html; \
  index index.html; \
  try_files \$uri \$uri/ /index.html; \
  } \
  }" > /etc/nginx/conf.d/default.conf

# Poort 80 blootstellen
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
