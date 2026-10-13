# Dockerfile para Dokploy / Docker / Coolify
FROM node:22-bookworm-slim AS runner

# Dependências de sistema:
# - openssl: necessário para o query-engine do Prisma no Linux
# - ffmpeg: processamento e compressão de mídia (vídeo e áudio)
# - ca-certificates: requisições HTTPS
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variáveis padrão de produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL="postgresql://neondb_owner:npg_wBtbuUG0MXK7@ep-patient-grass-b4czxdis-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
ENV STORAGE_DRIVER=local
ENV STORAGE_DIR="./storage"
ENV MEDIA_BASE_URL="/media"

# 1. Copia manifesto de pacotes e instala dependências necessárias para o build
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 2. Copia todo o código da aplicação
COPY . .

# 3. Gera o cliente Prisma e compila o Next.js
RUN npx prisma generate
RUN npm run build

# Porta da aplicação (padrão Dokploy: 3000)
EXPOSE 3000

# Inicia Next.js com sync do banco e worker em segundo plano
CMD ["npm", "run", "start:prod"]
