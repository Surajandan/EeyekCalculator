
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorContainer } from '@/components/calculator/calculator-container';
import { CalculatorHeader } from '@/components/calculator/calculator-header';
import { CalculatorDisplay } from '@/components/calculator/calculator-display';
import { Divide, X, Minus, Plus, Equal, Delete } from 'lucide-react'; // Changed Backspace to Delete
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
    doubleZero: "00",
    decimal: ".",
    percentageButton: "%",
  },
  mni: {
    pageTitle: "ꯂꯣꯀꯦꯜ ꯀꯦꯜꯛ",
    acButton: "AC",
    digits: ["꯰", "꯱", "꯲", "꯳", "꯴", "꯵", "꯶", "꯷", "꯸", "꯹"],
    doubleZero: "꯰꯰",
    decimal: ".",
    percentageButton: "%",
  }
};

export default function CalculatorPage() {
  const [currentOperand, setCurrentOperand] = useState<string>("0");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language, setLanguage] = useState<keyof typeof translations>("mni"); // Default language set to 'mni'
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem("calculatorHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    setCurrentOperand(translations[language].digits[0]);
  }, []); 

  useEffect(() => {
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

  const normalizeOperand = (operand: string, lang: keyof typeof translations) => {
    let normalized = String(operand); 
    const targetLangDigits = translations[lang].digits;
    const englishDigits = translations.en.digits;
    const targetDecimal = translations[lang].decimal;
    const englishDecimal = translations.en.decimal;
    const targetDoubleZero = translations[lang].doubleZero;
    const englishDoubleZero = translations.en.doubleZero;


    if (normalized === targetDoubleZero) {
      return englishDoubleZero;
    }

    targetLangDigits.forEach((targetDigit, index) => {
      const regex = new RegExp(targetDigit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      normalized = normalized.replace(regex, englishDigits[index]);
    });

    if (targetDecimal !== englishDecimal) {
      const decimalRegex = new RegExp(targetDecimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      normalized = normalized.replace(decimalRegex, englishDecimal);
    }
    return normalized;
  };

  const localizeOperand = (operand: string, lang: keyof typeof translations) => {
    let localized = String(operand); 
    const englishDigits = translations.en.digits;
    const targetLangDigits = translations[lang].digits;
    const englishDecimal = translations.en.decimal;
    const targetDecimal = translations[lang].decimal;
    const englishDoubleZero = translations.en.doubleZero;
    const targetDoubleZero = translations[lang].doubleZero;

    if (localized === englishDoubleZero) {
        return targetDoubleZero;
    }

    englishDigits.forEach((englishDigit, index) => {
      const regex = new RegExp(englishDigit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      localized = localized.replace(regex, targetLangDigits[index]);
    });

    if (englishDecimal !== targetDecimal) {
       const decimalRegex = new RegExp(englishDecimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
       localized = localized.replace(decimalRegex, targetDecimal);
    }
    return localized;
  };


  const addDigit = (value: string) => { // Renamed digit to value
    const englishValue = normalizeOperand(value, language); // Normalized value (e.g., "00", "5")
    const displayValue = value; // Value in current language (e.g., "꯰꯰", "꯵")

    if (currentOperand === "Error") {
      setCurrentOperand(displayValue);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      // If overwriting and adding "00", and current is "0", keep it "0"
      if (englishValue === "00" && normalizeOperand(currentOperand, language) === "0") {
        setCurrentOperand(translations[language].digits[0]);
      } else {
        setCurrentOperand(displayValue);
      }
      setOverwrite(false);
    } else {
      // If current is "0" and adding "00", keep current as "0"
      if (normalizeOperand(currentOperand, language) === "0" && englishValue === "00") return;
      // If current is "0" and adding single "0", keep current as "0"
      if (normalizeOperand(currentOperand, language) === "0" && englishValue === "0") return;
      
      if (currentOperand.length + englishValue.length > 16) return; // Check total length
      
      setCurrentOperand(prev => (normalizeOperand(prev, language) === "0" && englishValue !== ".") ? displayValue : prev + displayValue);
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
      if(currentOperand !== "Error") {
        setPreviousOperand(currentOperand);
      } else {
        setPreviousOperand(null);
      }
    } else {
      setPreviousOperand(currentOperand);
    }

    setOperation(op);
    setOverwrite(true);
  };

  const evaluate = () => {
    if (!operation || previousOperand === null || currentOperand === "Error") return;
    
    const prevNormalized = normalizeOperand(previousOperand, language);
    const currentNormalized = normalizeOperand(currentOperand, language);

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
    resultString = localizeOperand(resultString, language);
    
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
  
  const handlePercentage = () => {
    if (currentOperand === "Error") return;

    const currentNormalized = normalizeOperand(currentOperand, language);
    let result: number;

    if (previousOperand && operation) {
      const prevNormalized = normalizeOperand(previousOperand, language);
      result = (parseFloat(prevNormalized) * parseFloat(currentNormalized)) / 100;
    } else {
      result = parseFloat(currentNormalized) / 100;
    }
    
    let resultString = String(parseFloat(result.toPrecision(12)));
    resultString = localizeOperand(resultString, language);
    
    setCurrentOperand(resultString);
    if (!previousOperand || !operation) {
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
    } else {
        setOverwrite(false); 
    }
  };

  const handleBackspace = () => {
    if (currentOperand === "Error" || currentOperand === translations[language].digits[0]) {
      if (currentOperand === "Error") { // Ensure Error state also resets to 0
        setCurrentOperand(translations[language].digits[0]);
        setOverwrite(true);
      }
      return; // Do nothing if it's already "0" (localized)
    }

    if (currentOperand.length === 1) {
      setCurrentOperand(translations[language].digits[0]);
      setOverwrite(true);
    } else {
      setCurrentOperand(currentOperand.slice(0, -1));
      setOverwrite(false); // Allow further input
    }
  };

  const buttonClass = "w-full h-14 sm:h-16 text-xl sm:text-2xl rounded-lg shadow-md focus:ring-2 focus:ring-ring active:scale-95 transition-transform";
  const operatorButtonClass = `${buttonClass} bg-primary/80 hover:bg-primary/90 text-primary-foreground`;
  const getNumberButtonClass = (lang: keyof typeof translations) => `${buttonClass} bg-secondary hover:bg-secondary/90 text-secondary-foreground ${lang === 'mni' ? 'font-meetei' : ''}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4">
        <CalculatorContainer>
          <CalculatorHeader
            language={language}
            onLanguageChange={(lang) => {
              const newLang = lang as keyof typeof translations;
              const currentNormalized = normalizeOperand(currentOperand, language);
              setCurrentOperand(localizeOperand(currentNormalized, newLang));
              
              if(previousOperand){
                const prevNormalized = normalizeOperand(previousOperand, language);
                setPreviousOperand(localizeOperand(prevNormalized, newLang));
              }
              setLanguage(newLang);
            }}
            translations={translations}
          />
          <CalculatorDisplay currentOperand={currentOperand} expressionPreview={expressionPreview} />
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <Button onClick={clearAll} className={`${getNumberButtonClass(language)}`}>
              {translations[language].acButton}
            </Button>
            <Button onClick={handleBackspace} className={getNumberButtonClass(language)} aria-label="Backspace">
               <Delete size={24} />
            </Button>
            <Button onClick={handlePercentage} className={getNumberButtonClass(language)}>
                {translations[language].percentageButton}
            </Button>
            <Button onClick={() => chooseOperation('divide')} className={operatorButtonClass} aria-label="Divide"><Divide size={24} /></Button>

            {[7, 8, 9].map((digit) => (
              <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
                {translations[language].digits[digit]}
              </Button>
            ))}
            <Button onClick={() => chooseOperation('multiply')} className={operatorButtonClass} aria-label="Multiply"><X size={24} /></Button>

            {[4, 5, 6].map((digit) => (
              <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
                {translations[language].digits[digit]}
              </Button>
            ))}
            <Button onClick={() => chooseOperation('subtract')} className={operatorButtonClass} aria-label="Subtract"><Minus size={24} /></Button>

            {[1, 2, 3].map((digit) => (
              <Button key={digit} onClick={() => addDigit(translations[language].digits[digit])} className={getNumberButtonClass(language)}>
                {translations[language].digits[digit]}
              </Button>
            ))}
            <Button onClick={() => chooseOperation('add')} className={operatorButtonClass} aria-label="Add"><Plus size={24} /></Button>

            <Button onClick={() => addDigit(translations[language].digits[0])} className={getNumberButtonClass(language)}>
                {translations[language].digits[0]}
            </Button>
            <Button onClick={() => addDigit(translations[language].doubleZero)} className={getNumberButtonClass(language)}>
                {translations[language].doubleZero}
            </Button>
            <Button onClick={addDecimalPoint} className={getNumberButtonClass(language)}>
                {translations[language].decimal}
            </Button>
            <Button onClick={handleEquals} className={operatorButtonClass} aria-label="Equals"><Equal size={24} /></Button>
          </div>
        </CalculatorContainer>
      </main>
      <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <p className="mb-2">Your Ad Here - Support Local Calc!</p>
        <Image
          src="https://placehold.co/728x90.png"
          alt="Advertisement Placeholder"
          width={728}
          height={90}
          className="mx-auto w-full max-w-[728px] h-auto rounded-md shadow"
          data-ai-hint="advertisement banner"
          priority={false} 
        />
      </footer>
    </div>
  );
}
