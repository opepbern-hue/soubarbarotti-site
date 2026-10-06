import path from 'node:path';

function str(name: string, fallback = ''): string {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export const env = {
  get siteUrl() {
    return str('SITE_URL', 'http://localhost:3000').replace(/\/$/, '');
  },
  get sessionSecret() {
    const s = str('SESSION_SECRET');
    if (s.length < 32) throw new Error('SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres). Rode `npm run setup`.');
    return s;
  },
  get adminPasswordHash() {
    return str('ADMIN_PASSWORD_HASH');
  },
  /** `local` (pasta no disco) ou `r2` (Cloudflare R2 / qualquer S3) */
  get storageDriver(): 'local' | 'r2' {
    return str('STORAGE_DRIVER', 'local') === 'r2' ? 'r2' : 'local';
  },
  get storageDir() {
    return path.resolve(str('STORAGE_DIR', './storage'));
  },
  get uploadTmpDir() {
    return path.resolve(str('UPLOAD_TMP_DIR', './.data/uploads'));
  },
  /** Endereço público das mídias. Local: /media · R2: https://media.seudominio.com.br */
  get mediaBaseUrl() {
    return str('MEDIA_BASE_URL', '/media').replace(/\/$/, '');
  },
  r2: {
    get accountId() { return str('R2_ACCOUNT_ID'); },
    get accessKeyId() { return str('R2_ACCESS_KEY_ID'); },
    get secretAccessKey() { return str('R2_SECRET_ACCESS_KEY'); },
    get bucket() { return str('R2_BUCKET'); },
    get endpoint() {
      return str('R2_ENDPOINT') || `https://${str('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
    },
  },
  get ffmpegPath() {
    return str('FFMPEG_PATH');
  },
  get whatsappNotifyPhone() {
    return str('WHATSAPP_NOTIFY_PHONE').replace(/\D/g, '');
  },
  get callmebotApiKey() {
    return str('CALLMEBOT_APIKEY');
  },
  /** Tamanho máximo de upload, em MB */
  get maxVideoMb() {
    return Number(str('MAX_VIDEO_MB', '2048'));
  },
  get maxImageMb() {
    return Number(str('MAX_IMAGE_MB', '30'));
  },
};
