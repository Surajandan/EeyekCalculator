
"use client";

import Link from 'next/link';
import { History, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dispatch, SetStateAction } from 'react';

interface CalculatorHeaderProps {
  language: string;
  onLanguageChange: Dispatch<SetStateAction<string>>;
  translations: Record<string, Record<string, string>>;
}

export function CalculatorHeader({ language, onLanguageChange, translations }: CalculatorHeaderProps) {
  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang);
  };

  const currentTranslation = translations[language] || translations.en;

  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className={`text-2xl sm:text-3xl font-bold font-headline text-foreground ${language === 'mni' ? 'font-meetei' : ''}`}>
        {currentTranslation.pageTitle}
      </h1>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Change language">
              <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onSelect={() => handleLanguageSelect("en")} 
              disabled={language === "en"}
              className={language === 'mni' ? 'font-meetei' : ''}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem 
              onSelect={() => handleLanguageSelect("mni")} 
              disabled={language === "mni"}
              className={language === 'mni' ? 'font-meetei' : ''}
            >
              Meitei Mayek (ꯃꯤꯇꯩ ꯃꯌꯦꯛ)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/history" legacyBehavior>
          <Button variant="outline" size="icon" aria-label="View calculation history">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
