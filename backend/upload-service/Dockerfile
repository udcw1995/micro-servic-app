FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Persistent uploads volume
VOLUME ["/app/uploads"]

EXPOSE 3002

CMD ["npm", "start"]
