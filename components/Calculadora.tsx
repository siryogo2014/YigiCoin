'use client';

import React, { useState } from 'react';

interface CalculadoraProps {
  selectedTheme?: string;
}

function Calculadora({ selectedTheme = 'claro' }: CalculadoraProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [operationDisplay, setOperationDisplay] = useState('');

  const inputNumber = (num: number): void => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation: string): void => {
    const inputValue = parseFloat(display);

    if (isNaN(inputValue)) {
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setOperationDisplay(`${inputValue} ${nextOperation}`);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      if (isNaN(newValue)) {
        return;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setOperationDisplay(`${newValue} ${nextOperation}`);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = (): void => {
    const inputValue = parseFloat(display);

    if (isNaN(inputValue)) {
      return;
    }

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);

      if (isNaN(newValue)) {
        return;
      }

      setDisplay(String(newValue));
      setOperationDisplay(`${previousValue} ${operation} ${inputValue} = ${newValue}`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clearDisplay = (): void => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setOperationDisplay('');
  };

  const inputDecimal = (): void => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <div
      className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Calculadora
      </h3>
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-900' : 'bg-gray-900'} rounded-lg p-4 mb-4`}
      >
        <div
          className={`text-right text-white text-sm font-mono rounded p-2 mb-2 min-h-[24px] ${selectedTheme === 'oscuro' ? 'bg-gray-700' : 'bg-gray-800'}`}
        >
          {operationDisplay || ''}
        </div>
        <div
          className={`text-right text-white text-2xl font-mono rounded p-4 mb-4 ${selectedTheme === 'oscuro' ? 'bg-gray-700' : 'bg-gray-800'}`}
        >
          {display}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={clearDisplay}
            className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            C
          </button>
          <button
            onClick={() => inputOperation('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            ÷
          </button>
          <button
            onClick={() => inputOperation('*')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            ×
          </button>

          <button
            onClick={() => inputNumber(7)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            7
          </button>
          <button
            onClick={() => inputNumber(8)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            8
          </button>
          <button
            onClick={() => inputNumber(9)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            9
          </button>
          <button
            onClick={() => inputOperation('-')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            -
          </button>

          <button
            onClick={() => inputNumber(4)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            4
          </button>
          <button
            onClick={() => inputNumber(5)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            5
          </button>
          <button
            onClick={() => inputNumber(6)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            6
          </button>
          <button
            onClick={() => inputOperation('+')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            +
          </button>

          <button
            onClick={() => inputNumber(1)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            1
          </button>
          <button
            onClick={() => inputNumber(2)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            2
          </button>
          <button
            onClick={() => inputNumber(3)}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            3
          </button>
          <button
            onClick={performCalculation}
            className="row-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            =
          </button>

          <button
            onClick={() => inputNumber(0)}
            className={`col-span-2 font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className={`font-bold py-3 px-4 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
}

export default Calculadora;
