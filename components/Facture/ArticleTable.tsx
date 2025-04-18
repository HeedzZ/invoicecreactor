"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, HelpCircle } from "lucide-react";
import { Article } from "@/types/invoice";
import { v4 as uuidv4 } from "uuid";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArticleTableProps {
  articles: Article[];
  onChange: (articles: Article[]) => void;
  isVatExempt: boolean;
  onSubtotalChange: (subtotal: number) => void;
  onTaxTotalChange: (taxTotal: number) => void;
  onTotalChange: (total: number) => void;
}

export function ArticleTable({ 
  articles, 
  onChange, 
  isVatExempt,
  onSubtotalChange,
  onTaxTotalChange,
  onTotalChange
}: ArticleTableProps) {
  // TVA standard en France
  const standardVATRates = [
    { value: 0, label: "0%" },
    { value: 5.5, label: "5.5%" },
    { value: 10, label: "10%" },
    { value: 20, label: "20%" }
  ];

  const addNewLine = () => {
    const newArticle: Article = {
      id: uuidv4(),
      details: "",
      quantity: 1,
      rate: 0,
      tax: isVatExempt ? 0 : 20, // Taux standard par défaut (20%) ou 0 si exonéré
      amount: 0,
    };
    const updatedArticles = [...articles, newArticle];
    onChange(updatedArticles);
    updateTotals(updatedArticles);
  };

  const updateArticle = (id: string, field: keyof Article, value: string | number) => {
    const updatedArticles = articles.map((article) => {
      if (article.id === id) {
        const updatedArticle = { ...article, [field]: value };
        
        // Forcer le taux de TVA à 0 si exonéré
        if (isVatExempt && field === 'tax') {
          updatedArticle.tax = 0;
        }
        
        // Recalculate amount
        if (field === "quantity" || field === "rate" || field === "tax") {
          // Conversion explicite en nombre pour éviter les erreurs
          const quantity = Number(field === "quantity" ? value : article.quantity);
          const rate = Number(field === "rate" ? value : article.rate);
          const tax = isVatExempt ? 0 : Number(field === "tax" ? value : article.tax);
          
          const priceHT = quantity * rate;
          const taxAmount = priceHT * (tax / 100);
          updatedArticle.amount = priceHT + taxAmount;
        }
        
        return updatedArticle;
      }
      return article;
    });
    
    onChange(updatedArticles);
    updateTotals(updatedArticles);
  };

  const deleteLine = (id: string) => {
    const updatedArticles = articles.filter((article) => article.id !== id);
    onChange(updatedArticles);
    updateTotals(updatedArticles);
  };

  const updateTotals = (articles: Article[]) => {
    // Calcul du sous-total HT
    const subtotal = articles.reduce((sum, article) => {
      const quantity = Number(article.quantity);
      const rate = Number(article.rate);
      return sum + (quantity * rate);
    }, 0);
    
    // Calcul du montant de TVA
    const taxTotal = isVatExempt ? 0 : articles.reduce((sum, article) => {
      const quantity = Number(article.quantity);
      const rate = Number(article.rate);
      const tax = Number(article.tax);
      const priceHT = quantity * rate;
      return sum + (priceHT * (tax / 100));
    }, 0);
    
    // Calcul du total TTC
    const total = subtotal + taxTotal;
    
    // Appel des callbacks pour mettre à jour les valeurs dans le parent
    onSubtotalChange(subtotal);
    onTaxTotalChange(taxTotal);
    onTotalChange(total);
  };
  
  // Mise à jour des totaux au chargement du composant
  useEffect(() => {
    updateTotals(articles);
  }, [articles]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Articles et prestations</h2>
        {isVatExempt && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center text-xs text-muted-foreground">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  TVA non applicable (Article 293B du CGI)
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  TVA non applicable selon l'article 293B du Code Général des Impôts.
                  Régime de la franchise en base de TVA.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description*</TableHead>
            <TableHead>Quantité*</TableHead>
            <TableHead>Prix unitaire HT (€)*</TableHead>
            {!isVatExempt && <TableHead>TVA (%)</TableHead>}
            <TableHead>Montant TTC (€)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isVatExempt ? 5 : 6} className="text-center text-muted-foreground py-4">
                Aucun article. Cliquez sur "Ajouter une ligne" ci-dessous.
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Input
                    value={article.details}
                    onChange={(e) => updateArticle(article.id, "details", e.target.value)}
                    placeholder="Description de l'article ou prestation"
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={article.quantity}
                    onChange={(e) => updateArticle(article.id, "quantity", e.target.value)}
                    className="w-24"
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={article.rate}
                    onChange={(e) => updateArticle(article.id, "rate", e.target.value)}
                    className="w-24"
                    required
                  />
                </TableCell>
                {!isVatExempt && (
                  <TableCell>
                    <Select
                      value={article.tax.toString()}
                      onValueChange={(value) => updateArticle(article.id, "tax", parseFloat(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="TVA" />
                      </SelectTrigger>
                      <SelectContent>
                        {standardVATRates.map((rate) => (
                          <SelectItem key={rate.value} value={rate.value.toString()}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {article.amount.toFixed(2)} €
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLine(article.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Button onClick={addNewLine} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une ligne
      </Button>
    </div>
  );
}