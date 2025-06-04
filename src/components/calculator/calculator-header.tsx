
"use client";

import Link from 'next/link';
import { History, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Added DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { Dispatch, SetStateAction } from 'react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface CalculatorHeaderProps {
  language: string;
  onLanguageChange: Dispatch<SetStateAction<string>>;
  translations: Record<string, { pageTitle: string; [key: string]: any }>;
}

export function CalculatorHeader({ language, onLanguageChange, translations }: CalculatorHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang);
  };

  const handleHelpClick = () => {
    console.log("Help clicked");
    // Potentially navigate to a help page or open a help modal
  };

  const handleAboutClick = () => {
    console.log("About clicked");
    // Potentially navigate to an about page or open an about modal
  };

  const currentTranslationSet = translations[language] || translations.en;
  const pageTitle = currentTranslationSet.pageTitle || translations.en.pageTitle;

  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className={`text-2xl sm:text-3xl font-bold font-headline text-foreground ${language === 'mni' ? 'font-meetei' : ''}`}>
        {pageTitle}
      </h1>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Change language">
              {language === 'mni' ? (
                <span className="font-meetei text-sm leading-none">ꯃꯤ</span>
              ) : (
                <span className="text-sm leading-none">EN</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => handleLanguageSelect("en")}
              disabled={language === "en"}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleLanguageSelect("mni")}
              disabled={language === "mni"}
            >
              Meitei Mayek <span className="font-meetei">(ꯃꯤꯇꯩ ꯃꯌꯦꯛ)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/history" legacyBehavior>
          <Button variant="outline" size="icon" aria-label="View calculation history">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More information">
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleHelpClick}>
              Help
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleAboutClick}>
              About
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                if (mounted) {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }
              }}
            >
              {mounted ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Toggle Theme...'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
