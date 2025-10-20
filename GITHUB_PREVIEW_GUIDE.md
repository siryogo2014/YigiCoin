# Guía Rápida: Subir a GitHub y ver vista previa (Vercel)

## 1) Crear el repositorio
```bash
# dentro de la carpeta del proyecto
git init
git branch -m main
git add .
git commit -m "YigiCoin: primera subida"
# crea un repo vacío en GitHub y copia la URL
git remote add origin https://github.com/USUARIO/NOMBRE-REPO.git
git push -u origin main
```

## 2) Variables de entorno (GitHub/Vercel)
Crea el archivo `.env.local` en la raíz **(no lo subas)** con:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
NEXT_PUBLIC_PAYPAL_ENV=sandbox
NEXT_PUBLIC_PAYMENT_CONTRACT=0x...
NEXT_PUBLIC_DEFAULT_CHAIN_ID=137
NEXT_PUBLIC_ALLOWED_CHAIN_IDS=137,8453,11155111,80002

PAYMENT_WEBHOOK_URL=https://tu-backend.example.com/validate
PAYMENT_WEBHOOK_TOKEN=tu-token
PAYMENT_TIMEOUT_MS=10000
```

En **Vercel > Project Settings > Environment Variables** agrega las mismas claves.

## 3) Conectar Vercel
- Ve a https://vercel.com/new
- Importa tu repo de GitHub
- Framework: **Next.js**
- Node: **18+**
- Variables: agrega las del paso anterior
- Deploy

Cada push a `main` creará un **Preview Deployment** con una URL única.

## 4) Vista previa local (opcional)
```bash
npm install
npm run preview   # build + start (puerto 3000 por defecto)
```

## 5) Consejos
- Mantén `.env.local` fuera del repo (protegido por `.gitignore`).
- Si cambias las variables en Vercel, redeploy para que surtan efecto.
- Para logs y errores, revisa "Deployments" en Vercel.
