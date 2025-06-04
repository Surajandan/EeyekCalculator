interface CalculatorDisplayProps {
  currentOperand: string;
  expressionPreview: string;
}

export function CalculatorDisplay({ currentOperand, expressionPreview }: CalculatorDisplayProps) {
  return (
    <div className="bg-input text-right p-4 sm:p-6 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="text-muted-foreground text-sm sm:text-base h-5 sm:h-6 truncate">
        {expressionPreview || " "}
      </div>
      <div className="text-foreground text-3xl sm:text-4xl font-bold break-all h-10 sm:h-12 flex items-end justify-end">
        {currentOperand}
      </div>
    </div>
  );
}
