"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorContainer } from '@/components/calculator/calculator-container';
import { CalculatorHeader } from '@/components/calculator/calculator-header';
import { CalculatorDisplay } from '@/components/calculator/calculator-display';
import { Divide, X, Minus, Plus, Equal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
}

const MAX_HISTORY_ITEMS = 50; // Limit history size

export default function CalculatorPage() {
  const [currentOperand, setCurrentOperand] = useState<string>("0");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true); // Start by overwriting initial "0"
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem("calculatorHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("calculatorHistory", JSON.stringify(newHistory));
  }, []);

  const operationToSymbol = (op: string | null): string => {
    switch (op) {
      case 'divide': return '÷';
      case 'multiply': return '×';
      case 'subtract': return '−';
      case 'add': return '+';
      default: return '';
    }
  };
  
  const expressionPreview = previousOperand && operation 
    ? `${previousOperand} ${operationToSymbol(operation)}` 
    : '';

  const addDigit = (digit: string) => {
    if (currentOperand === "Error") {
      setCurrentOperand(digit);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setCurrentOperand(digit);
      setOverwrite(false);
    } else {
      if (digit === "0" && currentOperand === "0") return;
      if (currentOperand.length >= 16) return; // Max digit limit
      setCurrentOperand(prev => (prev === "0" && digit !== ".") ? digit : prev + digit);
    }
  };

  const addDecimalPoint = () => {
    if (currentOperand === "Error") {
      setCurrentOperand("0.");
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setCurrentOperand("0.");
      setOverwrite(false);
      return;
    }
    if (!currentOperand.includes('.')) {
      setCurrentOperand(prev => prev + '.');
    }
  };

  const chooseOperation = (op: string) => {
    if (currentOperand === "Error" && op) { // Allow choosing op if error, effectively clearing
        setPreviousOperand(null); 
        setOperation(null);
        // setCurrentOperand("0"); // Let next digit input handle error state
        // setOverwrite(true);
        return;
    }
    if (previousOperand !== null && operation !== null && !overwrite) { // !overwrite means currentOperand is a new number
      evaluate(); // Evaluate the previous operation before starting a new one
      // After evaluate, currentOperand holds the result. This result becomes previousOperand for the new op.
      setPreviousOperand(currentOperand); // This line was missing to chain operations correctly
    } else {
      setPreviousOperand(currentOperand);
    }
    
    setOperation(op);
    setOverwrite(true);
  };

  const evaluate = () => {
    if (!operation || previousOperand === null || currentOperand === "Error") return;

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    let computation: number;

    switch (operation) {
      case 'add': computation = prev + current; break;
      case 'subtract': computation = prev - current; break;
      case 'multiply': computation = prev * current; break;
      case 'divide':
        if (current === 0) {
          toast({ title: "Error", description: "Cannot divide by zero.", variant: "destructive" });
          setCurrentOperand("Error");
          setPreviousOperand(null);
          setOperation(null);
          setOverwrite(true);
          const errorEntry: HistoryItem = { 
            id: Date.now().toString(), 
            expression: `${previousOperand} ${operationToSymbol(operation)} ${currentOperand}`, 
            result: "Error" 
          };
          saveHistory([errorEntry, ...history.slice(0, MAX_HISTORY_ITEMS - 1)]);
          return;
        }
        computation = prev / current;
        break;
      default: return;
    }
    
    const resultString = String(parseFloat(computation.toPrecision(12))); // Handle floating point precision display
    const expressionString = `${previousOperand} ${operationToSymbol(operation)} ${currentOperand}`;
    const newEntry: HistoryItem = { id: Date.now().toString(), expression: expressionString, result: resultString };
    saveHistory([newEntry, ...history.slice(0, MAX_HISTORY_ITEMS - 1)]);
    
    setCurrentOperand(resultString);
    // For immediate further operations, the result is the new previousOperand if an operator is hit next.
    // For now, clearing previousOperand and operation means user needs to re-input if they want to use the result
    // setPreviousOperand(null); // This was the issue for chaining. It should become the result.
    // setOperation(null); // This should be cleared if they hit equals, not an op.
    
    // If equals was pressed, previousOperand should be cleared. If another op is pressed, it's handled by chooseOperation.
    // Let's manage this in chooseOperation for chaining, and clear for equals.
    // For now, set overwrite, previousOperand becomes current, operation is cleared.
    // This is logic for "=":
    setPreviousOperand(null); // After equals, previous is cleared
    setOperation(null);
    setOverwrite(true); // Ready for new input, result is displayed.
  };
  
  const handleEquals = () => {
    evaluate();
  }

  const clearAll = () => {
    setCurrentOperand("0");
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    if (currentOperand === "Error" || currentOperand === "0") return;
    setCurrentOperand(String(parseFloat(currentOperand) * -1));
  };

  const buttonClass = "w-full h-14 sm:h-16 text-xl sm:text-2xl rounded-lg shadow-md focus:ring-2 focus:ring-ring active:scale-95 transition-transform";
  const operatorButtonClass = `${buttonClass} bg-primary/80 hover:bg-primary/90 text-primary-foreground`;
  const numberButtonClass = `${buttonClass} bg-secondary hover:bg-secondary/90 text-secondary-foreground`;

  return (
    <CalculatorContainer>
      <CalculatorHeader />
      <CalculatorDisplay currentOperand={currentOperand} expressionPreview={expressionPreview} />
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <Button onClick={clearAll} className={`${numberButtonClass} col-span-2`}>AC</Button>
        <Button onClick={toggleSign} className={numberButtonClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h6"/>
            <path d="M7 4v6"/>
            <path d="M18 13H5"/>
          </svg>
        </Button>
        <Button onClick={() => chooseOperation('divide')} className={operatorButtonClass}><Divide size={24} /></Button>

        <Button onClick={() => addDigit('7')} className={numberButtonClass}>7</Button>
        <Button onClick={() => addDigit('8')} className={numberButtonClass}>8</Button>
        <Button onClick={() => addDigit('9')} className={numberButtonClass}>9</Button>
        <Button onClick={() => chooseOperation('multiply')} className={operatorButtonClass}><X size={24} /></Button>

        <Button onClick={() => addDigit('4')} className={numberButtonClass}>4</Button>
        <Button onClick={() => addDigit('5')} className={numberButtonClass}>5</Button>
        <Button onClick={() => addDigit('6')} className={numberButtonClass}>6</Button>
        <Button onClick={() => chooseOperation('subtract')} className={operatorButtonClass}><Minus size={24} /></Button>

        <Button onClick={() => addDigit('1')} className={numberButtonClass}>1</Button>
        <Button onClick={() => addDigit('2')} className={numberButtonClass}>2</Button>
        <Button onClick={() => addDigit('3')} className={numberButtonClass}>3</Button>
        <Button onClick={() => chooseOperation('add')} className={operatorButtonClass}><Plus size={24} /></Button>

        <Button onClick={() => addDigit('0')} className={`${numberButtonClass} col-span-2`}>0</Button>
        <Button onClick={addDecimalPoint} className={numberButtonClass}>.</Button>
        <Button onClick={handleEquals} className={operatorButtonClass}><Equal size={24} /></Button>
      </div>
    </CalculatorContainer>
  );
}
