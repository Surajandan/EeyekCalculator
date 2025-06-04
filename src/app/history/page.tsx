"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedHistory = localStorage.getItem("calculatorHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("calculatorHistory");
    setHistory([]);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-6">
        <header className="flex justify-between items-center mb-6">
          <Link href="/" legacyBehavior>
            <Button variant="outline" size="icon" aria-label="Back to calculator">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline text-foreground">Calculation History</h1>
          <Button variant="destructive" size="icon" onClick={clearHistory} disabled={history.length === 0} aria-label="Clear history">
            <Trash2 className="h-5 w-5" />
          </Button>
        </header>

        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No history yet. Perform some calculations!</p>
        ) : (
          <ScrollArea className="h-[60vh] sm:h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Expression</TableHead>
                  <TableHead className="text-right font-semibold">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.expression}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{item.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {history.length > 5 && (
                <TableCaption>Scroll to see more history.</TableCaption>
              )}
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
