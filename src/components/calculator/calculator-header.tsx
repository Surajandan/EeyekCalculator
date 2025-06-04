
"use client";

import Link from 'next/link';
import { History, Info, Languages, Moon, Sun, XIcon, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang);
  };

  const currentTranslationSet = translations[language] || translations.en;
  const pageTitle = currentTranslationSet.pageTitle || translations.en.pageTitle;

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <h1 className={`text-xl sm:text-2xl font-semibold font-headline text-foreground ${language === 'mni' ? 'font-meetei' : ''}`}>
          {pageTitle}
        </h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Change language" className="h-8 w-8 sm:h-9 sm:w-9">
                {language === 'mni' ? (
                  <span className="font-meetei text-sm sm:text-base leading-none">ꯃꯤ</span>
                ) : (
                  <span className="text-sm sm:text-base leading-none">EN</span>
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
                Meitei Mayek <span className={`font-meetei ${language === 'mni' ? '' : 'text-muted-foreground'}`}>(ꯃꯤꯇꯩ ꯃꯌꯦꯛ)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/history" legacyBehavior>
            <Button variant="outline" size="icon" aria-label="View calculation history" className="h-8 w-8 sm:h-9 sm:w-9">
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More information" className="h-8 w-8 sm:h-9 sm:w-9">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsHelpDialogOpen(true)}>
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsAboutDialogOpen(true)}>
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
                {mounted ? (
                  <>
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </>
                ) : (
                  'Toggle Theme...'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Eeyek Calculator Help</DialogTitle>
            <DialogDescription>
              A quick guide on how to use the calculator features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">1. Basic Input & Operations:</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Enter numbers using the digit buttons (0-9 or ꯰-꯹).</li>
                <li>Use operator buttons (+, -, ×, ÷) for calculations.</li>
                <li>Press the '=' button to see the result.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">2. Special Input Buttons:</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Decimal Point (.):</strong> Adds a decimal point to the current number.</li>
                <li><strong>Double Zero (00 or ꯰꯰):</strong> Adds two zeros to the current number. If the current number is '0', it remains '0'.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">3. Calculation Functions:</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>
                  <strong>Percentage (%):</strong>
                  <ul className="list-disc list-inside pl-6 space-y-1">
                    <li>If pressed after a number (e.g., "50 %"), it divides the number by 100 (result: "0.5").</li>
                    <li>If pressed during an operation (e.g., "100 + 50 %"), it calculates the percentage of the first number (e.g., 50% of 100 = 50), then you can press '=' to complete the operation ("100 + 50" = "150").</li>
                  </ul>
                </li>
                <li><strong>All Clear (AC):</strong> Clears the current input, previous input, and any selected operation, resetting the display to '0'.</li>
                <li><strong>Backspace (<Delete className="inline-block h-4 w-4 align-text-bottom" />):</strong> Deletes the last entered digit or decimal point from the current number. If the current number becomes empty, it resets to '0'.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">4. Language & Display:</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Language Switch (EN/ꯃꯤ):</strong> Click the button showing "EN" or "ꯃꯤ" to open a dropdown and switch between English and Meitei Mayek numerals and interface text.</li>
                <li><strong>Calculation History (<History className="inline-block h-4 w-4 align-text-bottom" />):</strong> Click the history icon to view past calculations. You can also clear history from this page.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">5. Other Features:</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Info Menu (<Info className="inline-block h-4 w-4 align-text-bottom" />):</strong>
                  <ul className="list-disc list-inside pl-6 space-y-1">
                    <li><strong>Help:</strong> Opens this guide.</li>
                    <li><strong>About:</strong> Displays information about the app.</li>
                    <li><strong>Theme Toggle (<Sun className="inline-block h-4 w-4 align-text-bottom" /> / <Moon className="inline-block h-4 w-4 align-text-bottom" />):</strong> Switches between light and dark themes.</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">About Eeyek Calculator</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-center space-y-2">
            <p>
              Eeyek Calculator
            </p>
            <p>
              Designed and Developed by:
              <br />
              <strong>Nongshaba Technology Solutions Private Limited</strong>
            </p>
          </div>
          <DialogFooter className="justify-center sm:justify-center">
            <p className="text-xs text-muted-foreground">
              Copyright © 2025 Nongshaba Technology Solutions Private Limited.
              <br />
              All rights reserved.
            </p>
          </DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4 w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
