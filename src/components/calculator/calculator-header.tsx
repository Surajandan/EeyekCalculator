
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
import { useState } from 'react';

export function CalculatorHeader() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    console.log(`Language changed to: ${lang}`);
    // In a real application, you would trigger your i18n logic here
    // to update the application's text content.
  };

  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">Local Calc</h1>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Change language">
              <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleLanguageChange("en")} disabled={selectedLanguage === "en"}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLanguageChange("es")} disabled={selectedLanguage === "es"}>
              Español
            </DropdownMenuItem>
            {/* You can add more languages here */}
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
