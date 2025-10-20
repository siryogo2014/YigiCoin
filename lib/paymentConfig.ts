// Configuración global de pagos
export const PAYMENT_CONFIG = {
  // PayPal Configuration
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your-paypal-client-id',
    environment: process.env.NEXT_PUBLIC_PAYPAL_ENV || 'sandbox', // sandbox | production
    currency: 'USD',
    intent: 'capture',
    brandName: 'YigiCoin',
    styles: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
      height: 45,
    },
  },

  // MetaMask/Web3 Configuration
  metamask: {
    supportedNetworks: {
      '1': {
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
        blockExplorer: 'https://etherscan.io',
        usdtContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
      },
      '137': {
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
        usdtContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
      },
      '56': {
        name: 'BSC',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorer: 'https://bscscan.com',
        usdtContract: '0x55d398326f99059fF775485246999027B3197955',
        decimals: 18,
      },
      '5': {
        name: 'Goerli Testnet',
        rpcUrl: 'https://goerli.infura.io/v3/your-infura-key',
        blockExplorer: 'https://goerli.etherscan.io',
        usdtContract: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        decimals: 6,
      },
    },
    defaultNetwork: '1',
    gasLimit: '21000',
    gasPrice: 'auto',
    confirmations: 3,
    timeout: 300000, // 5 minutos
    contractAddress: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT || '0x...',
  },

  // Configuración de tipos de pago
  paymentTypes: {
    registro: {
      amount: 3,
      currency: 'USD',
      description: 'Pago de registro inicial',
      allowedMethods: ['paypal', 'metamask'],
      maxRetries: 3,
      timeout: 600000, // 10 minutos
    },
    membresia: {
      amounts: {
        invitado: 5,
        basico: 10,
        vip: 50,
        premium: 400,
        elite: 6000,
      },
      currency: 'USD',
      description: 'Actualización de membresía',
      allowedMethods: ['paypal', 'metamask'],
      maxRetries: 3,
      timeout: 600000,
    },
    multa: {
      minAmount: 5,
      maxAmount: 100,
      currency: 'USD',
      description: 'Pago de multa por suspensión',
      allowedMethods: ['paypal', 'metamask'],
      maxRetries: 2,
      timeout: 300000, // 5 minutos
    },
    tiempo: {
      amounts: {
        '48h': 2,
        '100h': 5,
        '240h': 10,
        '500h': 20,
      },
      currency: 'USD',
      description: 'Recarga de tiempo activo',
      allowedMethods: ['paypal', 'metamask'],
      maxRetries: 3,
      timeout: 300000,
    },
  },

  // Configuración de seguridad
  security: {
    // Límites de pago
    maxPaymentAmount: 10000,
    maxDailyPayments: 10,
    maxHourlyPayments: 3,

    // Detección de fraude
    fraudDetection: {
      enabled: true,
      duplicateTimeWindow: 300000, // 5 minutos
      maxSimilarPayments: 3,
      suspiciousAmountThreshold: 5000,
      maxPaymentFrequency: 5, // por hora
    },

    // Validación
    validation: {
      requireConfirmation: true,
      minConfirmations: 3,
      maxValidationTime: 1800000, // 30 minutos
      autoValidate: true,
    },
  },

  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: true,
      templates: {
        paymentSuccess: 'payment-success',
        paymentFailed: 'payment-failed',
        fraudAlert: 'fraud-alert',
      },
    },
    webhook: {
      enabled: true,
      url: process.env.PAYMENT_WEBHOOK_URL || '',
      retries: 3,
      timeout: 10000,
    },
  },

  // Configuración de logs
  logging: {
    enabled: true,
    level: 'info', // debug | info | warn | error
    retention: 2592000000, // 30 días en ms
    sensitive: false, // No guardar datos sensibles
  },
};

// Tipos de TypeScript
export interface PaymentConfig {
  paypal: {
    clientId: string;
    environment: string;
    currency: string;
    intent: string;
    brandName: string;
    styles: Record<string, any>;
  };
  metamask: {
    supportedNetworks: Record<
      string,
      {
        name: string;
        rpcUrl: string;
        blockExplorer: string;
        usdtContract: string;
        decimals: number;
      }
    >;
    defaultNetwork: string;
    gasLimit: string;
    gasPrice: string;
    confirmations: number;
    timeout: number;
    contractAddress: string;
  };
  paymentTypes: {
    registro: PaymentTypeConfig;
    membresia: PaymentTypeConfig & { amounts: Record<string, number> };
    multa: PaymentTypeConfig & { minAmount: number; maxAmount: number };
    tiempo: PaymentTypeConfig & { amounts: Record<string, number> };
  };
  security: {
    maxPaymentAmount: number;
    maxDailyPayments: number;
    maxHourlyPayments: number;
    fraudDetection: {
      enabled: boolean;
      duplicateTimeWindow: number;
      maxSimilarPayments: number;
      suspiciousAmountThreshold: number;
      maxPaymentFrequency: number;
    };
    validation: {
      requireConfirmation: boolean;
      minConfirmations: number;
      maxValidationTime: number;
      autoValidate: boolean;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      templates: Record<string, string>;
    };
    webhook: {
      enabled: boolean;
      url: string;
      retries: number;
      timeout: number;
    };
  };
  logging: {
    enabled: boolean;
    level: string;
    retention: number;
    sensitive: boolean;
  };
}

interface PaymentTypeConfig {
  amount?: number;
  currency: string;
  description: string;
  allowedMethods: string[];
  maxRetries: number;
  timeout: number;
}

// Funciones auxiliares para configuración
export const getPaymentConfig = (type: string): PaymentTypeConfig | null => {
  return PAYMENT_CONFIG.paymentTypes[type as keyof typeof PAYMENT_CONFIG.paymentTypes] || null;
};

export const getNetworkConfig = (networkId: string) => {
  return PAYMENT_CONFIG.metamask.supportedNetworks[networkId] || null;
};

export const isPaymentMethodAllowed = (paymentType: string, method: string): boolean => {
  const config = getPaymentConfig(paymentType);
  return config ? config.allowedMethods.includes(method) : false;
};

export const getPaymentAmount = (paymentType: string, level?: string): number => {
  const config = getPaymentConfig(paymentType);
  if (!config) return 0;

  if (paymentType === 'registro') {
    return config.amount || 0;
  }

  if (paymentType === 'membresia' && level) {
    const membershipConfig = config as any;
    return membershipConfig.amounts[level] || 0;
  }

  if (paymentType === 'tiempo' && level) {
    const timeConfig = config as any;
    return timeConfig.amounts[level] || 0;
  }

  return 0;
};

export const validatePaymentSecurity = (
  userId: string,
  paymentType: string,
  amount: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const security = PAYMENT_CONFIG.security;

  // Validar monto máximo
  if (amount > security.maxPaymentAmount) {
    errors.push(`Monto excede el límite máximo de $${security.maxPaymentAmount}`);
  }

  // Validar límites diarios/horarios (simulado)
  const userPayments = JSON.parse(localStorage.getItem('payment_records') || '[]').filter(
    (p: any) => p.userId === userId
  );

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hourStart = new Date(now.getTime() - 3600000); // 1 hora atrás

  const dailyPayments = userPayments.filter(
    (p: any) => new Date(p.timestamp) >= dayStart && p.status === 'completed'
  );

  const hourlyPayments = userPayments.filter(
    (p: any) => new Date(p.timestamp) >= hourStart && p.status === 'completed'
  );

  if (dailyPayments.length >= security.maxDailyPayments) {
    errors.push('Límite diario de pagos alcanzado');
  }

  if (hourlyPayments.length >= security.maxHourlyPayments) {
    errors.push('Límite horario de pagos alcanzado');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default PAYMENT_CONFIG;
