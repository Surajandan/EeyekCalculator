interface CalculatorDisplayProps {
  currentOperand: string;
  expressionPreview: string;
}

export function CalculatorDisplay({ currentOperand, expressionPreview }: CalculatorDisplayProps) {
  return (
    <div className="bg-input text-right p-3 sm:p-4 rounded-lg shadow mb-4 overflow-hidden">
      <div className="text-muted-foreground text-base sm:text-lg h-6 sm:h-7 truncate">
        {expressionPreview}
      </div>
      <div className="text-foreground text-3xl sm:text-4xl font-bold break-all h-10 sm:h-12 flex items-end justify-end">
        {currentOperand}
      </div>
    </div>
  );
}
