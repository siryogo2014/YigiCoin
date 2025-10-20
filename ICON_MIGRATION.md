# Migración de Iconos: RemixIcon → Lucide React

## Estado Actual

El proyecto actualmente utiliza iconos de RemixIcon cargados desde CDN. Se ha iniciado la migración a `lucide-react` para:

- Mejor rendimiento (bundle local vs CDN)
- Type safety con TypeScript
- Consistencia con el ecosistema React

## Progreso de Migración

### ✅ Completado

- [x] Eliminado import de CDN de RemixIcon en `globals.css`
- [x] Añadida dependencia `lucide-react` a `package.json`
- [x] Creado archivo de mapeo `lib/icon-map.ts`
- [x] Migrados componentes de pago a emojis Unicode (independientes de librería)
  - `components/payments/MetaMaskPayment.tsx`
  - `components/payments/PayPalPayment.tsx`

### 🚧 Pendiente

- [ ] Migrar componentes restantes (~230 referencias)
  - `components/TopNavigation.tsx`
  - `components/modals/*`
  - `components/PanelDeControl.tsx`
  - `hooks/useSimulation.ts`
  - Otros componentes

## Guía de Migración

### Antes (RemixIcon)

```tsx
<i className="ri-star-line mr-2"></i>
```

### Después (Lucide React)

```tsx
import { Star } from 'lucide-react';

<Star size={16} className="mr-2" />;
```

### Mapeo de Iconos Comunes

Consulta `lib/icon-map.ts` para el mapeo completo. Algunos ejemplos:

| RemixIcon             | Lucide React | Uso                |
| --------------------- | ------------ | ------------------ |
| `ri-star-line`        | `Star`       | Ratings, favoritos |
| `ri-time-line`        | `Clock`      | Temporizadores     |
| `ri-user-line`        | `User`       | Perfil de usuario  |
| `ri-wallet-line`      | `Wallet`     | Pagos              |
| `ri-arrow-right-line` | `ArrowRight` | Navegación         |

## Alternativa: Emojis Unicode

Para componentes simples, se pueden usar emojis Unicode como alternativa temporal:

```tsx
// Antes
<i className="ri-wallet-line"></i>

// Alternativa con emoji
<span>🦊</span> {/* MetaMask */}
<span>💳</span> {/* PayPal */}
<span>⚠️</span> {/* Warning */}
<span>✅</span> {/* Success */}
```

### Ventajas de Emojis

- Sin dependencias externas
- Universal en todos los dispositivos
- Tamaño consistente
- Accesibilidad built-in

### Desventajas

- Menos control sobre estilo
- Variación entre sistemas operativos
- No todas las metáforas visuales disponibles

## Próximos Pasos

1. Instalar dependencias si no están:

   ```bash
   npm install lucide-react
   ```

2. Importar iconos necesarios:

   ```tsx
   import { Star, Clock, User } from 'lucide-react';
   ```

3. Reemplazar elementos `<i className="ri-*">` con componentes Lucide

4. Actualizar estilos si es necesario (Lucide usa `size` en lugar de clases CSS)

5. Probar la aplicación para asegurar que todos los iconos se renderizan correctamente

## Recursos

- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react)
- [Lucide Icon Search](https://lucide.dev/icons/)
- [Mapeo de Iconos](./lib/icon-map.ts)
