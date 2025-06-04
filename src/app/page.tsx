
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

const translations = {
  en: {
    pageTitle: "Local Calc",
    acButton: "AC",
    digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    decimal: ".",
  },
  mni: {
    pageTitle: "ꯂꯣꯀꯦꯜ ꯀꯦꯜꯛ",
    acButton: "AC", 
    digits: ["꯰", "꯱", "꯲", "꯳", "꯴", "꯵", "꯶", "꯷", "꯸", "꯹"],
    decimal: ".", 
  }
};

export default function CalculatorPage() {
  const [currentOperand, setCurrentOperand] = useState<string>("0");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language, setLanguage] = useState<keyof typeof translations>("en");
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem("calculatorHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    // Set initial currentOperand based on language
    setCurrentOperand(translations[language].digits[0]);
  }, []);

  useEffect(() => {
    // When language changes, if currentOperand is "0" or "꯰", update it
    if (currentOperand === translations.en.digits[0] || currentOperand === translations.mni.digits[0]) {
      setCurrentOperand(translations[language].digits[0]);
    }
  }, [language, currentOperand]);


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
    // Internally, we still use '0'-'9' for logic, convert displayed digit if needed
    const englishDigit = Object.keys(translations.mni.digits).find(key => translations.mni.digits[parseInt(key)] === digit) || digit;

    if (currentOperand === "Error") {
      setCurrentOperand(translations[language].digits[parseInt(englishDigit)]);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setCurrentOperand(translations[language].digits[parseInt(englishDigit)]);
      setOverwrite(false);
    } else {
      if (englishDigit === "0" && (currentOperand === translations.en.digits[0] || currentOperand === translations.mni.digits[0])) return;
      if (currentOperand.length >= 16) return; 
      setCurrentOperand(prev => ((prev === translations.en.digits[0] || prev === translations.mni.digits[0]) && englishDigit !== ".") ? translations[language].digits[parseInt(englishDigit)] : prev + translations[language].digits[parseInt(englishDigit)]);
    }
  };

  const addDecimalPoint = () => {
    const decimalSymbol = translations[language].decimal;
    if (currentOperand === "Error") {
      setCurrentOperand(translations[language].digits[0] + decimalSymbol);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setCurrentOperand(translations[language].digits[0] + decimalSymbol);
      setOverwrite(false);
      return;
    }
    if (!currentOperand.includes(decimalSymbol)) {
      setCurrentOperand(prev => prev + decimalSymbol);
    }
  };

  const chooseOperation = (op: string) => {
    if (currentOperand === "Error" && op) { 
        setPreviousOperand(null); 
        setOperation(null);
        return;
    }
    if (previousOperand !== null && operation !== null && !overwrite) { 
      evaluate(); 
      // After evaluation, currentOperand holds the result.
      // We need to ensure it's set as previousOperand *before* setting the new operation.
      setPreviousOperand(currentOperand); 
    } else {
      setPreviousOperand(currentOperand);
    }
    
    setOperation(op);
    setOverwrite(true);
  };
  
  const evaluate = () => {
    if (!operation || previousOperand === null || currentOperand === "Error") return;

    // Normalize operands to English numbers before parseFloat
    const normalizeOperand = (operand: string) => {
      if (language === 'mni') {
        let normalized = operand;
        translations.mni.digits.forEach((mniDigit, index) => {
          const regex = new RegExp(mniDigit, 'g');
          normalized = normalized.replace(regex, translations.en.digits[index]);
        });
        return normalized;
      }
      return operand;
    };
  
    const prevNormalized = normalizeOperand(previousOperand);
    const currentNormalized = normalizeOperand(currentOperand);

    const prev = parseFloat(prevNormalized);
    const current = parseFloat(currentNormalized);

    if (isNaN(prev) || isNaN(current)) {
        toast({ title: "Error", description: "Invalid number input.", variant: "destructive" });
        setCurrentOperand("Error");
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
        return;
    }

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
    
    let resultString = String(parseFloat(computation.toPrecision(12))); 
    
    // Convert result back to selected language if mni
    if (language === 'mni') {
      let mniResult = "";
      for (const char of resultString) {
        if (char >= '0' && char <= '9') {
          mniResult += translations.mni.digits[parseInt(char)];
        } else {
          mniResult += char; // Keep non-digits like '.', '-'
        }
      }
      resultString = mniResult;
    }

    const expressionString = `${previousOperand} ${operationToSymbol(operation)} ${currentOperand}`;
    const newEntry: HistoryItem = { id: Date.now().toString(), expression: expressionString, result: resultString };
    saveHistory([newEntry, ...history.slice(0, MAX_HISTORY_ITEMS - 1)]);
    
    setCurrentOperand(resultString);
    setPreviousOperand(null); 
    setOperation(null);
    setOverwrite(true); 
  };
  
  const handleEquals = () => {
    evaluate();
  }

  const clearAll = () => {
    setCurrentOperand(translations[language].digits[0]);
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    if (currentOperand === "Error" || currentOperand === translations[language].digits[0]) return;
    
    // Normalize to perform math
    let normalizedCurrentOperand = currentOperand;
    if (language === 'mni') {
        translations.mni.digits.forEach((mniDigit, index) => {
            const regex = new RegExp(mniDigit, 'g');
            normalizedCurrentOperand = normalizedCurrentOperand.replace(regex, translations.en.digits[index]);
        });
    }

    let toggledValue = String(parseFloat(normalizedCurrentOperand) * -1);

    // Convert back to selected language if mni
    if (language === 'mni') {
        let mniToggledValue = "";
        for (const char of toggledValue) {
            if (char >= '0' && char <= '9') {
                mniToggledValue += translations.mni.digits[parseInt(char)];
            } else if (char === translations.en.decimal && translations.mni.decimal) {
                mniToggledValue += translations.mni.decimal;
            } 
            else {
                mniToggledValue += char; // Keep non-digits like '-'
            }
        }
        toggledValue = mniToggledValue;
    }
    setCurrentOperand(toggledValue);
  };

  const buttonClass = "w-full h-14 sm:h-16 text-xl sm:text-2xl rounded-lg shadow-md focus:ring-2 focus:ring-ring active:scale-95 transition-transform";
  const operatorButtonClass = `${buttonClass} bg-primary/80 hover:bg-primary/90 text-primary-foreground`;
  const getNumberButtonClass = (lang: keyof typeof translations) => `${buttonClass} bg-secondary hover:bg-secondary/90 text-secondary-foreground ${lang === 'mni' ? 'font-meetei' : ''}`;


  return (
    <CalculatorContainer>
      <CalculatorHeader 
        language={language} 
        onLanguageChange={(lang) => {
          const newLang = lang as keyof typeof translations;
          setLanguage(newLang);
          // When language changes, reset display to 0 of the new language if it was 0 in old lang
          if (currentOperand === translations[language].digits[0]) {
             setCurrentOperand(translations[newLang].digits[0]);
          }
          if (previousOperand === translations[language].digits[0]) {
            setPreviousOperand(translations[newLang].digits[0]);
          }
        }}
        translations={translations} 
      />
      <CalculatorDisplay currentOperand={currentOperand} expressionPreview={expressionPreview} />
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <Button onClick={clearAll} className={`${getNumberButtonClass(language)} col-span-2`}>
          {translations[language].acButton}
        </Button>
        <Button onClick={toggleSign} className={getNumberButtonClass(language)}>
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

        {[7, 8, 9].map((digit) => (
          <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
            {translations[language].digits[digit]}
          </Button>
        ))}
        <Button onClick={() => chooseOperation('multiply')} className={operatorButtonClass}><X size={24} /></Button>

        {[4, 5, 6].map((digit) => (
          <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
            {translations[language].digits[digit]}
          </Button>
        ))}
        <Button onClick={() => chooseOperation('subtract')} className={operatorButtonClass}><Minus size={24} /></Button>

        {[1, 2, 3].map((digit) => (
          <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
            {translations[language].digits[digit]}
          </Button>
        ))}
        <Button onClick={() => chooseOperation('add')} className={operatorButtonClass}><Plus size={24} /></Button>

        <Button onClick={() => addDigit(translations[language].digits[0])} className={`${getNumberButtonClass(language)} col-span-2`}>
            {translations[language].digits[0]}
        </Button>
        <Button onClick={addDecimalPoint} className={getNumberButtonClass(language)}>
            {translations[language].decimal}
        </Button>
        <Button onClick={handleEquals} className={operatorButtonClass}><Equal size={24} /></Button>
      </div>
    </CalculatorContainer>
  );
}
