"use client";

import { useState } from "react";
import { ArticleTable } from "@/components/Facture/ArticleTable";
import { ClientForm } from "@/components/Facture/ClientForm";
import { Article, Client } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, Send } from "lucide-react";

export default function NewInvoicePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  const total = articles.reduce((sum, article) => sum + article.amount, 0);

  const getNextInvoiceNumber = () => {
    // Dans un cas réel, ceci serait géré par le backend
    return "INV-000008";
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
      </div>

      <Card className="p-6">
        <ClientForm
          invoiceNumber={getNextInvoiceNumber()}
          client={client}
          date={date}
          onClientChange={setClient}
          onDateChange={setDate}
        />

        <ArticleTable articles={articles} onChange={setArticles} />

        <div className="mt-6 border-t pt-6">
          <div className="flex justify-end text-lg font-semibold">
            <span>Total : {total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            * Champs obligatoires
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => console.log("Save as draft")}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer comme brouillon
            </Button>
            <Button onClick={() => console.log("Save and send")}>
              <Send className="mr-2 h-4 w-4" />
              Enregistrer et envoyer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}