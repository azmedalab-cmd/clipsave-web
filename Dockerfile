FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl ffmpeg \
  && curl -L --fail --silent --show-error https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
COPY index.html styles.css app.js server.mjs README.md ./

ENV NODE_ENV=production
ENV YTDLP_BIN=/usr/local/bin/yt-dlp
ENV PORT=10000

EXPOSE 10000
CMD ["npm", "start"]
