'use client';

import { useState, useEffect } from 'react';

interface PaymentRecord {
  id: string;
  userId: string;
  paymentType: 'registro' | 'membresia' | 'multa' | 'tiempo';
  method: 'paypal' | 'metamask';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  transactionHash?: string;
  description: string;
  timestamp: string;
  validatedAt?: string;
  validationResult?: 'valid' | 'invalid' | 'expired';
  metadata?: Record<string, any>;
}

interface ValidationResult {
  isValid: boolean;
  payment: PaymentRecord | null;
  errors: string[];
  warnings: string[];
}

export class PaymentValidator {
  private static instance: PaymentValidator;
  private validationRules: Map<string, (payment: PaymentRecord) => ValidationResult>;

  private constructor() {
    this.validationRules = new Map();
    this.initializeValidationRules();
  }

  public static getInstance(): PaymentValidator {
    if (!PaymentValidator.instance) {
      PaymentValidator.instance = new PaymentValidator();
    }
    return PaymentValidator.instance;
  }

  private initializeValidationRules(): void {
    // Reglas de validación para pago de registro
    this.validationRules.set('registro', (payment: PaymentRecord) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar monto exacto
      if (payment.amount !== 3) {
        errors.push('El monto de registro debe ser exactamente $3 USD');
      }

      // Validar que el usuario no tenga ya un pago de registro
      const existingPayments = this.getPaymentsByUser(payment.userId);
      const hasRegistrationPayment = existingPayments.some(
        (p) => p.paymentType === 'registro' && p.status === 'completed'
      );

      if (hasRegistrationPayment) {
        errors.push('El usuario ya tiene un pago de registro completado');
      }

      // Validar timestamp (no más de 1 hora)
      const paymentTime = new Date(payment.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - paymentTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 1) {
        warnings.push('El pago fue realizado hace más de 1 hora');
      }

      return {
        isValid: errors.length === 0,
        payment,
        errors,
        warnings,
      };
    });

    // Reglas de validación para pago de membresía
    this.validationRules.set('membresia', (payment: PaymentRecord) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar montos válidos para membresías
      const validAmounts = [5, 10, 50, 400, 6000];
      if (!validAmounts.includes(payment.amount)) {
        errors.push('Monto no válido para membresía');
      }

      // Validar que el usuario tenga registro activo
      const userData = this.getUserData(payment.userId);
      if (!userData.isActive) {
        errors.push('El usuario debe tener una cuenta activa');
      }

      // Validar que no esté pagando el mismo nivel
      const currentLevel = this.determineLevelByAmount(payment.amount);
      if (userData.currentLevel === currentLevel) {
        warnings.push('El usuario ya tiene este nivel de membresía');
      }

      return {
        isValid: errors.length === 0,
        payment,
        errors,
        warnings,
      };
    });

    // Reglas de validación para pago de multa
    this.validationRules.set('multa', (payment: PaymentRecord) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar que el usuario esté suspendido
      const userData = this.getUserData(payment.userId);
      if (!userData.isSuspended) {
        errors.push('El usuario no está suspendido');
      }

      // Validar monto de multa
      if (payment.amount < 5 || payment.amount > 100) {
        errors.push('Monto de multa fuera del rango válido ($5-$100)');
      }

      return {
        isValid: errors.length === 0,
        payment,
        errors,
        warnings,
      };
    });

    // Reglas de validación para pago de tiempo
    this.validationRules.set('tiempo', (payment: PaymentRecord) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar montos válidos para tiempo
      const validAmounts = [2, 5, 10, 20];
      if (!validAmounts.includes(payment.amount)) {
        errors.push('Monto no válido para recarga de tiempo');
      }

      // Validar que el usuario tenga cuenta activa
      const userData = this.getUserData(payment.userId);
      if (!userData.isActive) {
        errors.push('El usuario debe tener una cuenta activa');
      }

      return {
        isValid: errors.length === 0,
        payment,
        errors,
        warnings,
      };
    });
  }

  // Validar un pago específico
  public validatePayment(paymentId: string): ValidationResult {
    const payment = this.getPaymentById(paymentId);

    if (!payment) {
      return {
        isValid: false,
        payment: null,
        errors: ['Pago no encontrado'],
        warnings: [],
      };
    }

    // Validaciones generales
    const generalValidation = this.validateGeneralRules(payment);
    if (!generalValidation.isValid) {
      return generalValidation;
    }

    // Validaciones específicas por tipo
    const validator = this.validationRules.get(payment.paymentType);
    if (!validator) {
      return {
        isValid: false,
        payment,
        errors: ['Tipo de pago no válido'],
        warnings: [],
      };
    }

    const specificValidation = validator(payment);

    // Marcar como validado
    this.markAsValidated(payment, specificValidation.isValid);

    return specificValidation;
  }

  // Validar múltiples pagos
  public validateMultiplePayments(paymentIds: string[]): ValidationResult[] {
    return paymentIds.map((id) => this.validatePayment(id));
  }

  // Validar pagos pendientes de un usuario
  public validatePendingPayments(userId: string): ValidationResult[] {
    const userPayments = this.getPaymentsByUser(userId);
    const pendingPayments = userPayments.filter((p) => p.status === 'pending');

    return pendingPayments.map((payment) => this.validatePayment(payment.id));
  }

  // Validaciones generales
  private validateGeneralRules(payment: PaymentRecord): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar campos requeridos
    if (!payment.userId) errors.push('ID de usuario requerido');
    if (!payment.paymentType) errors.push('Tipo de pago requerido');
    if (!payment.method) errors.push('Método de pago requerido');
    if (!payment.amount || payment.amount <= 0) errors.push('Monto debe ser mayor a 0');
    if (!payment.timestamp) errors.push('Timestamp requerido');

    // Validar formato de timestamp
    if (payment.timestamp && isNaN(Date.parse(payment.timestamp))) {
      errors.push('Formato de timestamp inválido');
    }

    // Validar método de pago
    if (!['paypal', 'metamask'].includes(payment.method)) {
      errors.push('Método de pago no válido');
    }

    // Validar tipo de pago
    if (!['registro', 'membresia', 'multa', 'tiempo'].includes(payment.paymentType)) {
      errors.push('Tipo de pago no válido');
    }

    // Validar status
    if (!['pending', 'completed', 'failed', 'cancelled'].includes(payment.status)) {
      errors.push('Status de pago no válido');
    }

    // Validar transacción según método
    if (payment.method === 'paypal' && !payment.transactionId) {
      errors.push('Transaction ID requerido para PayPal');
    }

    if (payment.method === 'metamask' && !payment.transactionHash) {
      errors.push('Transaction Hash requerido para MetaMask');
    }

    return {
      isValid: errors.length === 0,
      payment,
      errors,
      warnings,
    };
  }

  // Detectar pagos fraudulentos
  public detectFraudulentPayments(userId: string): ValidationResult[] {
    const userPayments = this.getPaymentsByUser(userId);
    const fraudulentPayments: ValidationResult[] = [];

    userPayments.forEach((payment) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Detectar pagos duplicados
      const duplicates = userPayments.filter(
        (p) =>
          p.id !== payment.id &&
          p.paymentType === payment.paymentType &&
          p.amount === payment.amount &&
          Math.abs(new Date(p.timestamp).getTime() - new Date(payment.timestamp).getTime()) < 300000 // 5 minutos
      );

      if (duplicates.length > 0) {
        errors.push('Posible pago duplicado detectado');
      }

      // Detectar montos anómalos
      if (payment.amount > 10000) {
        warnings.push('Monto inusualmente alto');
      }

      // Detectar frecuencia anómala
      const recentPayments = userPayments.filter((p) => {
        const timeDiff = new Date().getTime() - new Date(p.timestamp).getTime();
        return timeDiff < 3600000; // 1 hora
      });

      if (recentPayments.length > 5) {
        warnings.push('Frecuencia de pagos anómalamente alta');
      }

      if (errors.length > 0 || warnings.length > 0) {
        fraudulentPayments.push({
          isValid: errors.length === 0,
          payment,
          errors,
          warnings,
        });
      }
    });

    return fraudulentPayments;
  }

  // Validar integridad de blockchain (para MetaMask)
  public async validateBlockchainTransaction(transactionHash: string): Promise<ValidationResult> {
    // Esta función debería conectarse a un proveedor de blockchain real
    // Por ahora, simulamos la validación

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Simular validación de blockchain
      const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(transactionHash);

      if (!isValidHash) {
        errors.push('Formato de hash de transacción inválido');
      }

      // Simular verificación de confirmaciones
      const confirmations = Math.floor(Math.random() * 20) + 1;
      if (confirmations < 3) {
        warnings.push('Transacción con pocas confirmaciones');
      }

      return {
        isValid: errors.length === 0,
        payment: null,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        payment: null,
        errors: ['Error al validar transacción en blockchain'],
        warnings: [],
      };
    }
  }

  // Métodos auxiliares
  private getPaymentById(paymentId: string): PaymentRecord | null {
    const payments = JSON.parse(localStorage.getItem('payment_records') || '[]');
    return payments.find((p: PaymentRecord) => p.id === paymentId) || null;
  }

  private getPaymentsByUser(userId: string): PaymentRecord[] {
    const payments = JSON.parse(localStorage.getItem('payment_records') || '[]');
    return payments.filter((p: PaymentRecord) => p.userId === userId);
  }

  private getUserData(userId: string): any {
    return JSON.parse(localStorage.getItem(`user_${userId}`) || '{}');
  }

  private markAsValidated(payment: PaymentRecord, isValid: boolean): void {
    const payments = JSON.parse(localStorage.getItem('payment_records') || '[]');
    const index = payments.findIndex((p: PaymentRecord) => p.id === payment.id);

    if (index !== -1) {
      payments[index].validatedAt = new Date().toISOString();
      payments[index].validationResult = isValid ? 'valid' : 'invalid';
      localStorage.setItem('payment_records', JSON.stringify(payments));
    }
  }

  private determineLevelByAmount(amount: number): string {
    if (amount >= 6000) return 'Elite';
    if (amount >= 400) return 'Premium';
    if (amount >= 50) return 'VIP';
    if (amount >= 10) return 'Básico';
    if (amount >= 5) return 'Invitado';
    return 'Registrado';
  }

  // Generar reporte de validación
  public generateValidationReport(userId?: string): any {
    const payments = userId
      ? this.getPaymentsByUser(userId)
      : JSON.parse(localStorage.getItem('payment_records') || '[]');

    const report = {
      totalPayments: payments.length,
      validPayments: 0,
      invalidPayments: 0,
      pendingValidation: 0,
      fraudulentPayments: 0,
      totalAmount: 0,
      paymentsByType: {
        registro: 0,
        membresia: 0,
        multa: 0,
        tiempo: 0,
      },
      paymentsByMethod: {
        paypal: 0,
        metamask: 0,
      },
      recentActivity: [] as any[],
    };

    payments.forEach((payment: PaymentRecord) => {
      // Contar por validación
      if (payment.validationResult === 'valid') report.validPayments++;
      else if (payment.validationResult === 'invalid') report.invalidPayments++;
      else report.pendingValidation++;

      // Contar por tipo
      report.paymentsByType[payment.paymentType]++;

      // Contar por método
      report.paymentsByMethod[payment.method]++;

      // Sumar montos
      if (payment.status === 'completed') {
        report.totalAmount += payment.amount;
      }

      // Actividad reciente (últimas 24 horas)
      const timeDiff = new Date().getTime() - new Date(payment.timestamp).getTime();
      if (timeDiff < 86400000) {
        // 24 horas
        report.recentActivity.push({
          id: payment.id,
          type: payment.paymentType,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          timestamp: payment.timestamp,
        });
      }
    });

    return report;
  }
}

// Hook para usar el validador
export const usePaymentValidator = () => {
  const [validator] = useState(() => PaymentValidator.getInstance());
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validatePayment = async (paymentId: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      const result = validator.validatePayment(paymentId);
      setValidationResults((prev) => [...prev, result]);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const validateUserPayments = async (userId: string): Promise<ValidationResult[]> => {
    setIsValidating(true);
    try {
      const results = validator.validatePendingPayments(userId);
      setValidationResults(results);
      return results;
    } finally {
      setIsValidating(false);
    }
  };

  const detectFraud = async (userId: string): Promise<ValidationResult[]> => {
    setIsValidating(true);
    try {
      const results = validator.detectFraudulentPayments(userId);
      return results;
    } finally {
      setIsValidating(false);
    }
  };

  const generateReport = (userId?: string) => {
    return validator.generateValidationReport(userId);
  };

  return {
    validatePayment,
    validateUserPayments,
    detectFraud,
    generateReport,
    validationResults,
    isValidating,
  };
};

export default PaymentValidator;
