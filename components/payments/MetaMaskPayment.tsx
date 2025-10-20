'use client';

import React, { useState, useEffect } from 'react';

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

interface EthereumWindow extends Window {
  ethereum?: {
    request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (data: unknown) => void) => void;
  };
}

declare let window: EthereumWindow;

// Network configurations for supported chains
interface NetworkConfig {
  chainId: string;
  chainIdHex: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  137: {
    chainId: '137',
    chainIdHex: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  8453: {
    chainId: '8453',
    chainIdHex: '0x2105',
    chainName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  11155111: {
    chainId: '11155111',
    chainIdHex: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  80002: {
    chainId: '80002',
    chainIdHex: '0x13882',
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
  },
};

const TOKEN_CONTRACTS: Record<string, string> = {
  '137': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
  '8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  '11155111': '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // USDT on Sepolia
  '80002': '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Amoy
};

function MetaMaskPayment({
  amount,
  paymentType,
  description,
  userId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = '',
}: MetaMaskPaymentProps) {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [networkId, setNetworkId] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [isValidConfig, setIsValidConfig] = useState(true);

  // Load configuration from environment variables
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT || '';
  const DEFAULT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '137');
  const ALLOWED_CHAIN_IDS = (process.env.NEXT_PUBLIC_ALLOWED_CHAIN_IDS || '137,8453,11155111,80002')
    .split(',')
    .map((id) => parseInt(id.trim()));

  useEffect(() => {
    // Validate configuration on mount
    validateConfiguration();
    checkMetaMaskInstallation();
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection();
      setupEventListeners();
    }
  }, []);

  const validateConfiguration = (): void => {
    // Check if CONTRACT_ADDRESS is set and not a placeholder
    if (
      !CONTRACT_ADDRESS ||
      CONTRACT_ADDRESS === '0x...' ||
      CONTRACT_ADDRESS.length < 42 ||
      !CONTRACT_ADDRESS.startsWith('0x')
    ) {
      setIsValidConfig(false);
      setError('Configuración incompleta: dirección de contrato no configurada');
    } else {
      setIsValidConfig(true);
    }
  };

  const checkMetaMaskInstallation = (): void => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsMetaMaskInstalled(true);
    } else {
      setIsMetaMaskInstalled(false);
    }
  };

  const setupEventListeners = (): void => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) =>
        handleAccountsChanged(accounts as string[])
      );
      window.ethereum.on('chainChanged', (chainId) => handleChainChanged(chainId as string));
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount('');
      setBalance('0');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      getBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string): void => {
    setNetworkId(chainId);
    setError(null);
    // Reload page to reset state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleDisconnect = (): void => {
    setIsConnected(false);
    setAccount('');
    setBalance('0');
  };

  const checkConnection = async (): Promise<void> => {
    try {
      const accounts = (await window.ethereum!.request({ method: 'eth_accounts' })) as string[];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getNetworkId();
        await getBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      setError(null);
      setIsProcessing(true);

      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }

      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length === 0) {
        throw new Error('No se pudo conectar con MetaMask');
      }

      setAccount(accounts[0]);
      setIsConnected(true);

      await getNetworkId();
      await validateAndSwitchNetwork();
      await getBalance(accounts[0]);
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Conexión cancelada por el usuario');
      } else {
        setError(error.message || 'Error al conectar con MetaMask');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getNetworkId = async (): Promise<void> => {
    try {
      const chainId = (await window.ethereum!.request({ method: 'eth_chainId' })) as string;
      setNetworkId(chainId);
    } catch (error) {
      console.error('Error getting network ID:', error);
    }
  };

  const validateAndSwitchNetwork = async (): Promise<void> => {
    try {
      const currentChainId = parseInt(networkId, 16);

      // Check if current network is supported
      if (!ALLOWED_CHAIN_IDS.includes(currentChainId)) {
        // Try to switch to default network
        const targetChainId = DEFAULT_CHAIN_ID;
        const networkConfig = NETWORK_CONFIGS[targetChainId];

        if (!networkConfig) {
          throw new Error(`Red no configurada: ${targetChainId}`);
        }

        try {
          // Try to switch to the network
          await window.ethereum!.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainIdHex }],
          });
          setNetworkId(networkConfig.chainIdHex);
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum!.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: networkConfig.chainIdHex,
                    chainName: networkConfig.chainName,
                    nativeCurrency: networkConfig.nativeCurrency,
                    rpcUrls: networkConfig.rpcUrls,
                    blockExplorerUrls: networkConfig.blockExplorerUrls,
                  },
                ],
              });
              setNetworkId(networkConfig.chainIdHex);
            } catch (addError: any) {
              throw new Error('No se pudo agregar la red a MetaMask');
            }
          } else {
            throw switchError;
          }
        }
      }
    } catch (error: any) {
      console.error('Error validating network:', error);
      setError(
        `Red no soportada. Por favor cambia a: ${ALLOWED_CHAIN_IDS.map((id) => NETWORK_CONFIGS[id]?.chainName).join(', ')}`
      );
      throw error;
    }
  };

  const getBalance = async (address: string): Promise<void> => {
    try {
      const chainIdDecimal = parseInt(networkId, 16).toString();
      const tokenContract = TOKEN_CONTRACTS[chainIdDecimal];

      if (!tokenContract) {
        setBalance('0');
        return;
      }

      const data = `0x70a08231000000000000000000000000${address.slice(2)}`;

      const balanceHex = (await window.ethereum!.request({
        method: 'eth_call',
        params: [{ to: tokenContract, data }, 'latest'],
      })) as string;

      const balanceInToken = parseInt(balanceHex, 16) / 1e6; // Assuming 6 decimals for USDT/USDC
      setBalance(balanceInToken.toFixed(2));
    } catch (error) {
      console.error('Error getting balance:', error);
      setBalance('0');
    }
  };

  const processPayment = async (): Promise<void> => {
    if (!isConnected || !account) {
      setError('Debes conectar tu wallet primero');
      return;
    }

    if (!isValidConfig) {
      setError('Configuración de pago incompleta. Contacta al administrador.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate network
      await validateAndSwitchNetwork();

      const currentChainId = parseInt(networkId, 16);
      const chainIdDecimal = currentChainId.toString();
      const tokenContract = TOKEN_CONTRACTS[chainIdDecimal];

      if (!tokenContract) {
        throw new Error('Red no soportada para pagos');
      }

      const balanceNum = parseFloat(balance);
      if (balanceNum < amount) {
        throw new Error(`Balance insuficiente. Necesitas ${amount} USDT/USDC`);
      }

      // Build transaction data for ERC20 transfer
      const amountInWei = Math.floor(amount * 1e6); // 6 decimals for USDT/USDC
      const amountHex = amountInWei.toString(16).padStart(64, '0');
      const addressHex = CONTRACT_ADDRESS.slice(2).padStart(64, '0');
      const transferData = `0xa9059cbb${addressHex}${amountHex}`;

      const txHash = (await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: tokenContract,
            data: transferData,
            gas: '0xC350', // 50,000 gas
          },
        ],
      })) as string;

      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(txHash);

      if (receipt.status === '0x1') {
        const networkConfig = NETWORK_CONFIGS[currentChainId];
        const paymentDetails = {
          transactionHash: txHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          from: account,
          to: CONTRACT_ADDRESS,
          amount,
          currency: 'USDT/USDC',
          network: networkConfig?.chainName || 'Unknown',
          networkId: chainIdDecimal,
          timestamp: new Date().toISOString(),
          paymentType,
          userId,
          description,
          status: 'completed',
        };

        await savePaymentRecord(paymentDetails);
        onSuccess(paymentDetails);
      } else {
        throw new Error('Transacción falló');
      }
    } catch (error: any) {
      let errorMessage = 'Error al procesar el pago';

      if (error.code === 4001) {
        errorMessage = 'Transacción cancelada por el usuario';
        onCancel();
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Fondos insuficientes en tu wallet';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Error de gas. Verifica que tengas suficiente para las fees';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      onError({ ...error, message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const waitForTransactionReceipt = async (
    txHash: string,
    maxAttempts = 60
  ): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkReceipt = async (): Promise<void> => {
        try {
          attempts++;
          const receipt = await window.ethereum!.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });

          if (receipt) {
            resolve(receipt as Record<string, unknown>);
          } else if (attempts >= maxAttempts) {
            reject(new Error('Timeout esperando confirmación de transacción'));
          } else {
            setTimeout(checkReceipt, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkReceipt();
    });
  };

  const savePaymentRecord = async (paymentDetails: Record<string, unknown>): Promise<void> => {
    try {
      const paymentRecord = {
        id: `metamask_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        userId,
        paymentType,
        method: 'metamask',
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'completed',
        transactionHash: paymentDetails.transactionHash,
        blockNumber: paymentDetails.blockNumber,
        gasUsed: paymentDetails.gasUsed,
        fromAddress: paymentDetails.from,
        toAddress: paymentDetails.to,
        network: paymentDetails.network,
        networkId: paymentDetails.networkId,
        description,
        timestamp: paymentDetails.timestamp,
        metadata: {
          walletAddress: account,
        },
      };

      if (typeof window !== 'undefined') {
        const existingPayments = JSON.parse(localStorage.getItem('payment_records') || '[]');
        existingPayments.push(paymentRecord);
        localStorage.setItem('payment_records', JSON.stringify(existingPayments));
      }
    } catch (error) {
      console.error('Error saving payment record:', error);
    }
  };

  const installMetaMask = (): void => {
    if (typeof window !== 'undefined') {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const getCurrentNetworkName = (): string => {
    if (!networkId) return 'Desconocida';
    const chainIdDecimal = parseInt(networkId, 16);
    return NETWORK_CONFIGS[chainIdDecimal]?.chainName || 'No soportada';
  };

  const isNetworkSupported = (): boolean => {
    if (!networkId) return false;
    const chainIdDecimal = parseInt(networkId, 16);
    return ALLOWED_CHAIN_IDS.includes(chainIdDecimal);
  };

  // Render states
  if (!isMetaMaskInstalled) {
    return (
      <div className={`${className} bg-orange-50 border border-orange-200 rounded-lg p-4`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🦊</div>
          <h3 className="font-medium text-orange-800 mb-2">MetaMask Requerido</h3>
          <p className="text-sm text-orange-700 mb-4">
            Necesitas instalar MetaMask para usar esta opción de pago
          </p>
          <button
            onClick={installMetaMask}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
          >
            Instalar MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (!isValidConfig) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4`}>
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="font-medium text-red-800 mb-2">Configuración Incompleta</h3>
          <p className="text-sm text-red-700">
            La dirección del contrato de pagos no está configurada. Por favor contacta al
            administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className={`${className} opacity-50 cursor-not-allowed`}>
        <div className="bg-gray-300 text-gray-500 py-3 px-4 rounded-lg text-center">
          🦊 MetaMask - No disponible
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-800">Pago con MetaMask</p>
            <p className="text-xs text-orange-600">{description}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-orange-800">${amount}</span>
            <p className="text-xs text-orange-600">USDT/USDC</p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
            isProcessing
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Conectando...
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">🦊</span>
              Conectar MetaMask
            </div>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cuenta conectada:</span>
              <span className="font-mono text-gray-800">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Balance:</span>
              <span className="font-semibold text-green-600">${balance} USDT/USDC</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Red:</span>
              <span
                className={`font-medium ${isNetworkSupported() ? 'text-green-600' : 'text-red-600'}`}
              >
                {getCurrentNetworkName()}
                {!isNetworkSupported() && ' ❌'}
              </span>
            </div>
          </div>

          {!isNetworkSupported() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Red no soportada. Redes permitidas:
              </p>
              <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                {ALLOWED_CHAIN_IDS.map((chainId) => (
                  <li key={chainId}>{NETWORK_CONFIGS[chainId]?.chainName}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={
              isProcessing ||
              parseFloat(balance) < amount ||
              !isNetworkSupported() ||
              !isValidConfig
            }
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isProcessing ||
              parseFloat(balance) < amount ||
              !isNetworkSupported() ||
              !isValidConfig
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando...
              </div>
            ) : parseFloat(balance) < amount ? (
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                Balance insuficiente
              </div>
            ) : !isNetworkSupported() ? (
              <div className="flex items-center">
                <span className="mr-2">🔄</span>
                Cambia a una red soportada
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">💸</span>
                Pagar ${amount} USDT/USDC
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default MetaMaskPayment;
