"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentTerms } from "@/types/invoice";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PaymentTermsFormProps {
  paymentTerms: PaymentTerms | null;
  onPaymentTermsChange: (paymentTerms: PaymentTerms) => void;
}

export function PaymentTermsForm({ paymentTerms, onPaymentTermsChange }: PaymentTermsFormProps) {
  const defaultPaymentTerms: PaymentTerms = {
    daysLimit: 30,
    method: "Virement bancaire",
    latePaymentPenalty: 10.12, // Taux légal + 10 points
    lumpSumCompensation: 40, // Indemnité forfaitaire légale
    bankDetails: {
      bankName: "Banque Exemple",
      iban: "FR76 1234 5678 9101 1121 3141 516",
      bic: "EXAMPLFR"
    }
  };

  const [termsData, setTermsData] = useState<PaymentTerms>(paymentTerms || defaultPaymentTerms);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTermsData({
        ...termsData,
        [parent]: {
          ...(termsData as any)[parent],
          [child]: value
        }
      });
    } else {
      // Conversion des valeurs numériques
      if (['daysLimit', 'latePaymentPenalty', 'lumpSumCompensation', 'earlyPaymentDiscount'].includes(name)) {
        const numValue = parseFloat(value) || 0;
        setTermsData({
          ...termsData,
          [name]: numValue
        });
      } else {
        setTermsData({
          ...termsData,
          [name]: value
        });
      }
    }
    
    onPaymentTermsChange(termsData);
  };

  const handleSelectChange = (value: string) => {
    setTermsData({
      ...termsData,
      method: value
    });
    onPaymentTermsChange({...termsData, method: value});
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md mb-8">
      <h2 className="text-lg font-medium mb-4">Conditions de paiement</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="payment-terms">
          <AccordionTrigger className="text-sm font-medium">
            Détails des conditions de paiement
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daysLimit">Délai de paiement (jours)*</Label>
                  <Input
                    id="daysLimit"
                    name="daysLimit"
                    type="number"
                    min="0"
                    max="60" // Maximum légal en France
                    value={termsData.daysLimit}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Maximum légal : 60 jours</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="method">Méthode de paiement*</Label>
                  <Select 
                    value={termsData.method} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                      <SelectItem value="Chèque">Chèque</SelectItem>
                      <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                      <SelectItem value="Prélèvement">Prélèvement</SelectItem>
                      <SelectItem value="Espèces">Espèces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latePaymentPenalty">Pénalités de retard (%)*</Label>
                  <Input
                    id="latePaymentPenalty"
                    name="latePaymentPenalty"
                    type="number"
                    min="0"
                    step="0.01"
                    value={termsData.latePaymentPenalty}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Trois fois le taux d'intérêt légal (minimum légal)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lumpSumCompensation">Indemnité forfaitaire (€)*</Label>
                  <Input
                    id="lumpSumCompensation"
                    name="lumpSumCompensation"
                    type="number"
                    min="40"
                    step="0.01"
                    value={termsData.lumpSumCompensation}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum légal : 40€</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="earlyPaymentDiscount">Escompte pour paiement anticipé (%)</Label>
                <Input
                  id="earlyPaymentDiscount"
                  name="earlyPaymentDiscount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={termsData.earlyPaymentDiscount || ""}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              {termsData.method === "Virement bancaire" && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium">Coordonnées bancaires</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.bankName">Banque</Label>
                    <Input
                      id="bankDetails.bankName"
                      name="bankDetails.bankName"
                      value={termsData.bankDetails?.bankName || ""}
                      onChange={handleChange}
                      placeholder="Nom de la banque"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.iban">IBAN</Label>
                    <Input
                      id="bankDetails.iban"
                      name="bankDetails.iban"
                      value={termsData.bankDetails?.iban || ""}
                      onChange={handleChange}
                      placeholder="FR76 1234 5678 9101 1121 3141 516"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.bic">BIC</Label>
                    <Input
                      id="bankDetails.bic"
                      name="bankDetails.bic"
                      value={termsData.bankDetails?.bic || ""}
                      onChange={handleChange}
                      placeholder="EXAMPLFR"
                    />
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Affichage résumé des conditions de paiement */}
      <div className="mt-2 text-sm text-muted-foreground">
        <p>Paiement par {termsData.method} à {termsData.daysLimit} jours</p>
        <p>Pénalités de retard : {termsData.latePaymentPenalty}%, indemnité forfaitaire : {termsData.lumpSumCompensation}€</p>
        {termsData.earlyPaymentDiscount && termsData.earlyPaymentDiscount > 0 && (
          <p>Escompte pour paiement anticipé : {termsData.earlyPaymentDiscount}%</p>
        )}
      </div>
    </div>
  );
} 