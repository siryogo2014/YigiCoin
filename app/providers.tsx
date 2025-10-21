// app/providers.tsx
'use client';
import * as React from 'react';
export default function Providers({ children }: { children: React.ReactNode }) {
  // Proveedor mínimo: renderiza hijos sin dependencias del hook/useSimulation
  return <>{children}</>;
}
