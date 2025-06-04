
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorContainer } from '@/components/calculator/calculator-container';
import { CalculatorHeader } from '@/components/calculator/calculator-header';
import { CalculatorDisplay } from '@/components/calculator/calculator-display';
import { Divide, X, Minus, Plus, Equal } from 'lucide-react';
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
    decimal: ".",
    percentageButton: "%",
  },
  mni: {
    pageTitle: "ꯂꯣꯀꯦꯜ ꯀꯦꯜꯛ",
    acButton: "AC",
    digits: ["꯰", "꯱", "꯲", "꯳", "꯴", "꯵", "꯶", "꯷", "꯸", "꯹"],
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
    // Set initial currentOperand based on language
    setCurrentOperand(translations[language].digits[0]);
  }, []); // language is available here due to initial state

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

  const normalizeOperand = (operand: string, lang: keyof typeof translations) => {
    let normalized = String(operand); // Ensure operand is a string
    const targetLangDigits = translations[lang].digits;
    const englishDigits = translations.en.digits;
    const targetDecimal = translations[lang].decimal;
    const englishDecimal = translations.en.decimal;

    // Normalize digits from current language to English
    targetLangDigits.forEach((targetDigit, index) => {
      const regex = new RegExp(targetDigit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      normalized = normalized.replace(regex, englishDigits[index]);
    });

    // Normalize decimal point from current language to English
    if (targetDecimal !== englishDecimal) {
      const decimalRegex = new RegExp(targetDecimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      normalized = normalized.replace(decimalRegex, englishDecimal);
    }
    return normalized;
  };

  const localizeOperand = (operand: string, lang: keyof typeof translations) => {
    let localized = String(operand); // Ensure operand is a string
    const englishDigits = translations.en.digits;
    const targetLangDigits = translations[lang].digits;
    const englishDecimal = translations.en.decimal;
    const targetDecimal = translations[lang].decimal;

    // Localize digits from English to current language
    englishDigits.forEach((englishDigit, index) => {
      const regex = new RegExp(englishDigit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      localized = localized.replace(regex, targetLangDigits[index]);
    });

    // Localize decimal point from English to current language
    if (englishDecimal !== targetDecimal) {
       const decimalRegex = new RegExp(englishDecimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
       localized = localized.replace(decimalRegex, targetDecimal);
    }
    return localized;
  };


  const addDigit = (digit: string) => {
    const englishDigit = normalizeOperand(digit, language);
    const displayDigit = digit; // Use the already localized digit passed to the function

    if (currentOperand === "Error") {
      setCurrentOperand(displayDigit);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setCurrentOperand(displayDigit);
      setOverwrite(false);
    } else {
      if (englishDigit === "0" && normalizeOperand(currentOperand, language) === "0") return;
      if (currentOperand.length >= 16) return; // Max length check
      setCurrentOperand(prev => (normalizeOperand(prev, language) === "0" && englishDigit !== ".") ? displayDigit : prev + displayDigit);
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

  const toggleSign = () => {
    if (currentOperand === "Error" || normalizeOperand(currentOperand, language) === "0") return;

    const normalizedCurrentOperand = normalizeOperand(currentOperand, language);
    let toggledValue = String(parseFloat(normalizedCurrentOperand) * -1);
    toggledValue = localizeOperand(toggledValue, language);
    setCurrentOperand(toggledValue);
    setOverwrite(false); 
  };
  
  const handlePercentage = () => {
    if (currentOperand === "Error") return;

    const currentNormalized = normalizeOperand(currentOperand, language);
    let result: number;

    if (previousOperand && operation) {
      // Scenario: X + Y %
      const prevNormalized = normalizeOperand(previousOperand, language);
      result = (parseFloat(prevNormalized) * parseFloat(currentNormalized)) / 100;
    } else {
      // Scenario: Y %
      result = parseFloat(currentNormalized) / 100;
    }
    
    let resultString = String(parseFloat(result.toPrecision(12)));
    resultString = localizeOperand(resultString, language);
    
    setCurrentOperand(resultString);
    // For "X + Y %", we want to keep previousOperand and operation, and allow "=" to be pressed.
    // For "Y %", previousOperand and operation should be cleared.
    if (!previousOperand || !operation) {
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
    } else {
        setOverwrite(false); // So the user sees the percentage value and can press =
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
              setLanguage(newLang);
              
              setCurrentOperand(localizeOperand(normalizeOperand(currentOperand, language), newLang));
              if(previousOperand){
                setPreviousOperand(localizeOperand(normalizeOperand(previousOperand, language), newLang));
              }
            }}
            translations={translations}
          />
          <CalculatorDisplay currentOperand={currentOperand} expressionPreview={expressionPreview} />
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <Button onClick={clearAll} className={`${getNumberButtonClass(language)}`}>
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
            <Button onClick={handlePercentage} className={getNumberButtonClass(language)}>
                {translations[language].percentageButton}
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
