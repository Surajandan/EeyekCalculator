
import type { ReactNode } from 'react';

interface CalculatorContainerProps {
  children: ReactNode;
}

export function CalculatorContainer({ children }: CalculatorContainerProps) {
  return (
    <div className="w-full max-w-xs bg-card rounded-xl shadow-2xl p-3 sm:p-5">
      {children}
    </div>
  );
}
