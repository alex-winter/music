FROM debian:bookworm-slim

ARG NODE_VERSION=20.20.1

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    python3 \
    python3-pip \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
  && tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v${NODE_VERSION}-linux-x64.tar.xz" \
  && node --version \
  && npm --version

RUN python3 -m pip install --no-cache-dir --break-system-packages yt-dlp \
  && yt-dlp --version \
  && ffmpeg -version

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

RUN mkdir -p /app/downloads

VOLUME ["/app/downloads"]

EXPOSE 3000

CMD ["npm", "start"]
