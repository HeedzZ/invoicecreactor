"use client";

import { Card } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";

interface InvoiceSummaryProps {
  subtotal: number;
  taxTotal: number;
  total: number;
  date: Date;
  daysLimit: number;
  isVatExempt: boolean;
}

export function InvoiceSummary({ 
  subtotal, 
  taxTotal, 
  total, 
  date, 
  daysLimit,
  isVatExempt
}: InvoiceSummaryProps) {
  // Calcul de la date d'échéance
  const dueDate = addDays(date, daysLimit);
  
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total HT :</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          
          {!isVatExempt && (
            <div className="flex justify-between text-sm">
              <span>Total TVA :</span>
              <span>{taxTotal.toFixed(2)} €</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total TTC :</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            <div className="flex justify-between">
              <span>Date d'échéance :</span>
              <span>{format(dueDate, "d MMMM yyyy", { locale: fr })}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {isVatExempt && (
        <div className="text-sm text-muted-foreground italic">
          TVA non applicable, article 293B du Code Général des Impôts.
        </div>
      )}
    </div>
  );
} 