import Link from 'next/link';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CalculatorHeader() {
  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">Local Calc</h1>
      <Link href="/history" legacyBehavior>
        <Button variant="outline" size="icon" aria-label="View calculation history">
          <History className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </Link>
    </header>
  );
}
