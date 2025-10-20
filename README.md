# YigiCoin Platform - Plataforma de Crecimiento Económico

## 📋 Descripción

YigiCoin es una plataforma Next.js 14 diseñada para gestionar pagos y membresías con integración de PayPal y MetaMask. Soporta pagos con criptomonedas en múltiples redes blockchain y pagos tradicionales con PayPal.

## ✨ Características Principales

- 💳 **Pagos con PayPal** - Integración completa con validación backend
- 🦊 **Pagos con MetaMask** - Soporte para múltiples redes blockchain
- 🔐 **Validación de Pagos** - Endpoint API para validación en servidor
- 🌐 **Multi-red** - Polygon, Base, Sepolia, y Polygon Amoy
- 📱 **Responsive** - Diseño adaptable con Tailwind CSS
- 🎨 **UI Moderna** - Componentes React optimizados

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ o superior
- npm 10+
- MetaMask instalado (para pagos crypto)
- Cuenta de PayPal Developer (para pagos PayPal)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd yigicoin-platform

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Ejecutar en desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:3000
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

#### PayPal Configuration
```bash
# Tu Client ID de PayPal (obtener en https://developer.paypal.com)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Entorno: "sandbox" para pruebas, "production" para producción
NEXT_PUBLIC_PAYPAL_ENV=sandbox
```

#### MetaMask / Blockchain Configuration
```bash
# Dirección de tu contrato para recibir pagos (REQUERIDO)
# DEBE ser una dirección válida de Ethereum/Polygon (42 caracteres, inicia con 0x)
NEXT_PUBLIC_PAYMENT_CONTRACT=0x1234567890123456789012345678901234567890

# ID de red por defecto (137 = Polygon PoS)
NEXT_PUBLIC_DEFAULT_CHAIN_ID=137

# IDs de redes permitidas (separados por coma)
NEXT_PUBLIC_ALLOWED_CHAIN_IDS=137,8453,11155111,80002
```

#### Payment Webhook Configuration (Opcional)
```bash
# URL de tu webhook backend para validación de pagos
PAYMENT_WEBHOOK_URL=https://your-webhook.example.com/validate

# Token de autenticación para el webhook (opcional)
PAYMENT_WEBHOOK_TOKEN=your-webhook-token

# Timeout para peticiones al webhook en millisegundos
PAYMENT_TIMEOUT_MS=10000
```

### Redes Blockchain Soportadas

| Chain ID | Nombre | Tipo | RPC URL |
|----------|--------|------|---------|
| 137 | Polygon PoS | Mainnet | https://polygon-rpc.com |
| 8453 | Base | Mainnet | https://mainnet.base.org |
| 11155111 | Sepolia | Testnet | https://rpc.sepolia.org |
| 80002 | Polygon Amoy | Testnet | https://rpc-amoy.polygon.technology |

### Cómo Cambiar de Red en MetaMask

1. **Automático:** El componente intentará cambiar automáticamente a una red soportada
2. **Manual:** 
   - Abrir MetaMask
   - Click en el menú de redes (parte superior)
   - Seleccionar una red de la lista soportada
   - Si no aparece, el componente ofrecerá agregarla

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build y Producción
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción

# Validación y Calidad
npm run lint             # Ejecuta ESLint
npm run type-check       # Verifica tipos de TypeScript
npm run format           # Verifica formato con Prettier
npm run format:fix       # Corrige formato automáticamente
```

## 🏗️ Estructura del Proyecto

```
yigicoin-platform/
├── app/                          # App directory de Next.js 14
│   ├── api/                      # API Routes
│   │   └── payments/
│   │       └── validate/         # Endpoint de validación de pagos
│   │           └── route.ts
│   ├── login/                    # Página de login
│   ├── registro/                 # Página de registro
│   ├── recuperar-password/       # Recuperación de contraseña
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globales
│
├── components/                   # Componentes React
│   ├── payments/                 # Componentes de pago
│   │   ├── MetaMaskPayment.tsx  # Pago con MetaMask
│   │   ├── PayPalPayment.tsx    # Pago con PayPal
│   │   ├── PaymentProcessor.tsx # Procesador de pagos
│   │   └── PaymentValidator.tsx # Validador
│   ├── modals/                   # Modales
│   └── ...                       # Otros componentes
│
├── hooks/                        # Custom hooks
│   ├── useAccount.ts
│   ├── useModals.ts
│   ├── useSimulation.ts
│   └── useTimer.ts
│
├── lib/                          # Utilidades
│   ├── icon-map.ts              # Mapeo de iconos
│   └── paymentConfig.ts         # Configuración de pagos
│
├── .env.example                  # Ejemplo de variables de entorno
├── .prettierrc                   # Configuración de Prettier
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.js            # Configuración de Tailwind
├── tsconfig.json                 # Configuración de TypeScript
└── package.json                  # Dependencias y scripts
```

## 💳 Componentes de Pago

### MetaMaskPayment

Componente para pagos con criptomonedas usando MetaMask.

**Características:**
- ✅ Detección automática de MetaMask
- ✅ Validación de red blockchain
- ✅ Cambio automático de red
- ✅ Agregado de red si no existe
- ✅ Validación de balance
- ✅ Manejo robusto de errores
- ✅ Feedback visual de estados

**Props:**
```typescript
interface MetaMaskPaymentProps {
  amount: number;
  paymentType: 'registro' | 'membresia' | 'multa' | 'tiempo';
  description: string;
  userId: string;
  onSuccess: (details: Record<string, unknown>) => void;
  onError: (error: Record<string, unknown>) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Ejemplo de Uso:**
```tsx
import MetaMaskPayment from '@/components/payments/MetaMaskPayment';

<MetaMaskPayment
  amount={10}
  paymentType="membresia"
  description="Membresía Premium"
  userId="user123"
  onSuccess={(details) => console.log('Pago exitoso', details)}
  onError={(error) => console.error('Error en pago', error)}
  onCancel={() => console.log('Pago cancelado')}
/>
```

### PayPalPayment

Componente para pagos tradicionales con PayPal.

**Características:**
- ✅ Integración oficial de PayPal SDK
- ✅ Validación de Client ID
- ✅ Estados de carga del SDK
- ✅ Validación en backend
- ✅ Modo sandbox/production
- ✅ Manejo de errores completo

**Props:**
```typescript
interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  paymentType: 'registro' | 'membresia' | 'multa' | 'tiempo';
  description: string;
  userId: string;
  onSuccess: (details: Record<string, unknown>) => void;
  onError: (error: Record<string, unknown>) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Ejemplo de Uso:**
```tsx
import PayPalPayment from '@/components/payments/PayPalPayment';

<PayPalPayment
  amount={10}
  currency="USD"
  paymentType="membresia"
  description="Membresía Premium"
  userId="user123"
  onSuccess={(details) => console.log('Pago exitoso', details)}
  onError={(error) => console.error('Error en pago', error)}
  onCancel={() => console.log('Pago cancelado')}
/>
```

## 🔌 API Endpoints

### POST /api/payments/validate

Valida y reenvía información de pagos a un webhook backend externo.

**Request:**
```json
{
  "provider": "paypal" | "metamask",
  "paymentDetails": {
    "orderID": "...",
    "amount": 10,
    "currency": "USD",
    ...
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment validated successfully",
  "data": { ... }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Características:**
- ⏱️ Timeout configurable (`PAYMENT_TIMEOUT_MS`)
- 🔄 Reintentos automáticos con backoff exponencial
- 🔐 Autenticación con Bearer token (opcional)
- 🛡️ Graceful degradation si webhook no disponible

## ⚠️ Notas Importantes

### output: "export" y API Routes

Este proyecto **NO** debe usar `output: "export"` en `next.config.mjs` porque:
- ❌ Las API routes no funcionan con exportación estática
- ❌ `/api/payments/validate` requiere server-side rendering
- ✅ El proyecto está configurado correctamente para SSR

**Cuándo usar `output: "export"`:**
- Solo si NO necesitas API routes
- Solo si NO necesitas validación de pagos en servidor
- Para deploy en hosting estático (GitHub Pages, S3, etc.)

### Seguridad

⚠️ **IMPORTANTE:** Nunca expongas información sensible en el cliente:

```bash
# ✅ CORRECTO - Variables públicas
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
NEXT_PUBLIC_PAYMENT_CONTRACT=0x...
NEXT_PUBLIC_DEFAULT_CHAIN_ID=137

# ❌ INCORRECTO - No usar NEXT_PUBLIC_ para secretos
NEXT_PUBLIC_PAYPAL_SECRET=xxx  # ¡MAL!
NEXT_PUBLIC_API_KEY=xxx        # ¡MAL!

# ✅ CORRECTO - Secretos solo en servidor
PAYMENT_WEBHOOK_TOKEN=xxx
PAYPAL_SECRET=xxx
```

## 🎨 Migración de Iconos

El proyecto está en proceso de migración de RemixIcon (CDN) a Lucide React (bundle local).

**Estado Actual:**
- ✅ CDN de RemixIcon removido
- ✅ `lucide-react` instalado
- ✅ Componentes de pago migrados a emojis Unicode
- ⚠️ ~230 referencias pendientes en otros componentes

**Para migrar componentes:**

Ver guía completa en [`ICON_MIGRATION.md`](./ICON_MIGRATION.md)

```tsx
// Antes (RemixIcon)
<i className="ri-star-line mr-2"></i>

// Después (Lucide React)
import { Star } from 'lucide-react';
<Star size={16} className="mr-2" />

// Alternativa temporal (Emoji)
<span>⭐</span>
```

## 🐛 Solución de Problemas

### Error: MetaMask no detectado

**Problema:** El componente muestra "MetaMask Requerido"

**Solución:**
1. Instalar MetaMask: https://metamask.io/download/
2. Recargar la página
3. Conectar wallet cuando se solicite

### Error: Red no soportada

**Problema:** MetaMask muestra "Red no soportada"

**Solución:**
1. El componente intentará cambiar automáticamente
2. Si falla, cambiar manualmente en MetaMask
3. Seleccionar una de: Polygon, Base, Sepolia, o Polygon Amoy

### Error: Configuración incompleta

**Problema:** "PayPal Client ID no configurado" o "Dirección de contrato no configurada"

**Solución:**
1. Verificar que `.env.local` existe
2. Verificar que las variables están correctamente configuradas
3. Reiniciar servidor de desarrollo: `npm run dev`

### Error al cargar PayPal SDK

**Problema:** "Error al cargar PayPal SDK"

**Solución:**
1. Verificar conexión a internet
2. Verificar que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` es válido
3. Revisar consola del navegador para más detalles

## 📚 Recursos

### Documentación Externa
- [Next.js Documentation](https://nextjs.org/docs)
- [PayPal Developer](https://developer.paypal.com/)
- [MetaMask Developer](https://docs.metamask.io/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [Base Documentation](https://docs.base.org/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Documentación del Proyecto
- [`CHANGELOG.md`](./CHANGELOG.md) - Historial de cambios detallado
- [`ICON_MIGRATION.md`](./ICON_MIGRATION.md) - Guía de migración de iconos
- [`INFORME_FINAL.md`](./INFORME_FINAL.md) - Resumen ejecutivo del proyecto

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código

```bash
# Antes de commit
npm run format:fix    # Formatear código
npm run lint          # Verificar linting
npm run type-check    # Verificar tipos
npm run build         # Asegurar que compila
```

## 📄 Licencia

Este proyecto está bajo una licencia privada. Todos los derechos reservados.

## 👥 Autores

- **Equipo YigiCoin** - Desarrollo inicial
- **DeepAgent (Abacus.AI)** - Correcciones y mejoras

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Última actualización:** 16 de Octubre, 2024  
**Versión:** 1.0.0  
**Next.js:** 14.0.4  
**React:** 18
