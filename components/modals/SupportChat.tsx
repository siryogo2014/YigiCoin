'use client';

import React, { useState } from 'react';

interface SupportChatProps {
  show: boolean;
  onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({ show, onClose }) => {
  const [message, setMessage] = useState('');

  if (!show) return null;

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Mensaje enviado:', message);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="ri-customer-service-line text-lg"></i>
            <span className="font-semibold">Soporte</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700">
              ¡Hola! Soy el asistente de soporte. ¿En qué puedo ayudarte hoy?
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <i className="ri-send-plane-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
