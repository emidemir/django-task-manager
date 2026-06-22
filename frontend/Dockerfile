# ==========================================
# STAGE 1: Build the React Application
# ==========================================
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
# We do this before copying the rest of the code to cache the node_modules
COPY package*.json ./
RUN npm install

# Copy the rest of the React code
COPY . .

# Build the project for production
# NOTE: If you are using Vite, this usually outputs to a 'dist' folder.
# If you are using Create React App (CRA), it outputs to a 'build' folder.
RUN npm run build

# ==========================================
# STAGE 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the static files from the build stage
# IMPORTANT: Change '/app/build' to '/app/dist' if you are using Vite!
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]