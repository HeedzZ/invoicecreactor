"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentTerms } from "@/types/invoice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionalField } from "@/components/ui/optional-field";
import { CreditCardIcon, InfoIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentTermsFormProps {
  paymentTerms: PaymentTerms | null;
  onPaymentTermsChange: (paymentTerms: PaymentTerms) => void;
}

export const PaymentTermsForm = ({ paymentTerms, onPaymentTermsChange }: PaymentTermsFormProps) => {
  const defaultPaymentTerms: PaymentTerms = {
    daysLimit: 30,
    method: "Virement bancaire",
    latePaymentPenalty: 10.12, // Taux légal + 10 points
    lumpSumCompensation: 40, // Indemnité forfaitaire légale
    bankDetails: {
      bankName: "",
      iban: "",
      bic: ""
    }
  };

  // Assurer que l'état initial a toujours un objet bankDetails valide
  const initialPaymentTerms = paymentTerms ? {
    ...paymentTerms,
    bankDetails: paymentTerms.bankDetails || {
      bankName: "",
      iban: "",
      bic: ""
    }
  } : defaultPaymentTerms;

  const [termsData, setTermsData] = useState<PaymentTerms>(initialPaymentTerms);
  const [hasEarlyPaymentDiscount, setHasEarlyPaymentDiscount] = useState(!!initialPaymentTerms.earlyPaymentDiscount);
  const [hasBankDetails, setHasBankDetails] = useState(
    // Vérifier que bankDetails est défini et au moins une des propriétés est non vide
    !!initialPaymentTerms.bankDetails && 
    !!(initialPaymentTerms.bankDetails.iban || initialPaymentTerms.bankDetails.bic || initialPaymentTerms.bankDetails.bankName)
  );

  // Mettre à jour l'état avec les nouvelles props si elles changent
  useEffect(() => {
    if (paymentTerms) {
      const updatedTerms = {
        ...paymentTerms,
        // Toujours s'assurer que bankDetails existe
        bankDetails: paymentTerms.bankDetails || { bankName: "", iban: "", bic: "" }
      };
      
      setTermsData(updatedTerms);
      setHasEarlyPaymentDiscount(!!paymentTerms.earlyPaymentDiscount);
      setHasBankDetails(!!(updatedTerms.bankDetails.iban || updatedTerms.bankDetails.bic || updatedTerms.bankDetails.bankName));
    }
  }, [paymentTerms]);

  // Notifier le parent des changements
  useEffect(() => {
    // Toujours s'assurer que bankDetails existe dans les données envoyées au parent
    const dataToSend = {
      ...termsData,
      bankDetails: termsData.bankDetails || { bankName: "", iban: "", bic: "" }
    };
    onPaymentTermsChange(dataToSend);
  }, [termsData, onPaymentTermsChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Pour les coordonnées bancaires, toujours utiliser un objet existant ou créer un nouveau
      if (parent === 'bankDetails') {
        setTermsData({
          ...termsData,
          bankDetails: {
            ...((termsData.bankDetails || { bankName: "", iban: "", bic: ""})), // Toujours avoir un objet valide
            [child]: value
          }
        });
      } else {
        setTermsData({
          ...termsData,
          [parent]: {
            ...(termsData as any)[parent],
            [child]: value
          }
        });
      }
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
  };

  const handleSelectChange = (value: string) => {
    // Assurer que bankDetails existe toujours
    const newTermsData = {
      ...termsData,
      method: value,
      bankDetails: termsData.bankDetails || { bankName: "", iban: "", bic: "" }
    };
    
    // Si on change la méthode et qu'on ne sélectionne pas "Virement bancaire", désactiver les détails bancaires
    if (value !== "Virement bancaire") {
      setHasBankDetails(false);
    }
    
    setTermsData(newTermsData);
  };

  const handleToggleEarlyPaymentDiscount = (enabled: boolean) => {
    setHasEarlyPaymentDiscount(enabled);
    if (!enabled) {
      setTermsData({
        ...termsData,
        earlyPaymentDiscount: undefined
      });
    } else {
      setTermsData({
        ...termsData,
        earlyPaymentDiscount: 2 // Valeur par défaut
      });
    }
  };

  const handleToggleBankDetails = (enabled: boolean) => {
    setHasBankDetails(enabled);
    
    // Assurons-nous que l'objet bankDetails existe toujours
    if (!enabled) {
      // Désactivation: garder l'objet vide mais valide
      setTermsData({
        ...termsData,
        bankDetails: {
          bankName: "",
          iban: "",
          bic: ""
        }
      });
    } else {
      // Activation: préserver les valeurs existantes ou initialiser avec des chaînes vides
      const currentBankDetails = termsData.bankDetails || { bankName: "", iban: "", bic: "" };
      setTermsData({
        ...termsData,
        bankDetails: {
          ...currentBankDetails
        }
      });
    }
  };

  return (
    <Card className="mb-8 bg-muted/10">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2 text-primary" />
          <CardTitle>Conditions de paiement</CardTitle>
        </div>
        <CardDescription>
          Définissez les modalités de règlement de la facture
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="basic" className="mb-4">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Conditions de base</TabsTrigger>
            <TabsTrigger value="penalties">Pénalités et compensations</TabsTrigger>
            <TabsTrigger value="extras">Options supplémentaires</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daysLimit" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Délai de paiement (jours)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">Maximum légal : 60 jours</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Méthode de paiement
                </Label>
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
            
            {termsData.method === "Virement bancaire" && (
              <OptionalField 
                label="Coordonnées bancaires" 
                defaultEnabled={hasBankDetails}
                onToggle={handleToggleBankDetails}
                tooltip="Informations bancaires pour le virement"
                className="mt-4 border-t pt-4"
              >
                <div className="space-y-4">
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
              </OptionalField>
            )}
          </TabsContent>
          
          <TabsContent value="penalties" className="space-y-4">
            <div className="flex items-center mb-2">
              <AlertTriangleIcon className="w-4 h-4 mr-2 text-amber-500" />
              <p className="text-sm text-muted-foreground">Mentions légalement obligatoires en France</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latePaymentPenalty" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Pénalités de retard (%)
                </Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lumpSumCompensation" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Indemnité forfaitaire (€)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">Minimum légal : 40€</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="extras">
            <OptionalField 
              label="Escompte pour paiement anticipé" 
              defaultEnabled={hasEarlyPaymentDiscount}
              onToggle={handleToggleEarlyPaymentDiscount}
              tooltip="Réduction accordée en cas de paiement avant échéance"
            >
              <div className="space-y-2">
                <Label htmlFor="earlyPaymentDiscount">Pourcentage d'escompte (%)</Label>
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
            </OptionalField>
          </TabsContent>
        </Tabs>
        
        {/* Affichage résumé des conditions de paiement */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm">
            <h3 className="font-medium mb-2">Résumé des conditions</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Paiement par {termsData.method} à {termsData.daysLimit} jours</li>
              <li>• Pénalités de retard : {termsData.latePaymentPenalty}% par an</li>
              <li>• Indemnité forfaitaire de recouvrement : {termsData.lumpSumCompensation} €</li>
              {hasEarlyPaymentDiscount && termsData.earlyPaymentDiscount && termsData.earlyPaymentDiscount > 0 && (
                <li>• Escompte pour paiement anticipé : {termsData.earlyPaymentDiscount}%</li>
              )}
              {hasBankDetails && termsData.method === "Virement bancaire" && termsData.bankDetails?.iban && (
                <li>• Coordonnées bancaires fournies pour le virement</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 