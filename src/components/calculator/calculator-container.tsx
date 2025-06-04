import type { ReactNode } from 'react';

interface CalculatorContainerProps {
  children: ReactNode;
}

export function CalculatorContainer({ children }: CalculatorContainerProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xs bg-card rounded-xl shadow-2xl p-3 sm:p-5">
        {children}
      </div>
    </div>
  );
}
