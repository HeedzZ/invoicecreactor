"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Company, Address } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface CompanyFormProps {
  company: Company | null;
  onCompanyChange: (company: Company | null) => void;
}

export function CompanyForm({ company, onCompanyChange }: CompanyFormProps) {
  const [expanded, setExpanded] = useState(false);

  const defaultCompany: Company = {
    name: "Votre Entreprise",
    address: {
      street: "1 rue Exemple",
      postalCode: "75000",
      city: "Paris",
      country: "France"
    },
    siret: "12345678900012",
    rcs: "Paris B 123 456 789",
    legalForm: "Micro-entreprise",
    vatNumber: "FR12345678900",
    isVatExempt: true,
    email: "contact@entreprise.fr",
    phone: "01 23 45 67 89",
  };

  const [companyData, setCompanyData] = useState<Company>(company || defaultCompany);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCompanyData({
        ...companyData,
        [parent]: {
          ...(companyData as any)[parent],
          [child]: value
        }
      });
    } else {
      setCompanyData({
        ...companyData,
        [name]: value
      });
    }
    
    onCompanyChange(companyData);
  };

  const handleSwitchChange = (checked: boolean) => {
    const updatedCompany = {
      ...companyData,
      isVatExempt: checked
    };
    setCompanyData(updatedCompany);
    onCompanyChange(updatedCompany);
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Informations de l'entreprise</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <EyeOffIcon className="h-4 w-4 mr-2" />
              Masquer les détails
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4 mr-2" />
              Afficher les détails
            </>
          )}
        </Button>
      </div>
      
      {/* Informations de base toujours visibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'entreprise*</Label>
          <Input
            id="name"
            name="name"
            value={companyData.name}
            onChange={handleChange}
            placeholder="Nom de l'entreprise"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET*</Label>
          <Input
            id="siret"
            name="siret"
            value={companyData.siret}
            onChange={handleChange}
            placeholder="12345678900012"
            required
          />
        </div>
      </div>
      
      {/* Informations détaillées, affichées uniquement si expanded est true */}
      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.street">Adresse*</Label>
              <Input
                id="address.street"
                name="address.street"
                value={companyData.address.street}
                onChange={handleChange}
                placeholder="Rue et numéro"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="address.postalCode">Code postal*</Label>
                <Input
                  id="address.postalCode"
                  name="address.postalCode"
                  value={companyData.address.postalCode}
                  onChange={handleChange}
                  placeholder="75000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.city">Ville*</Label>
                <Input
                  id="address.city"
                  name="address.city"
                  value={companyData.address.city}
                  onChange={handleChange}
                  placeholder="Paris"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique*</Label>
              <Input
                id="legalForm"
                name="legalForm"
                value={companyData.legalForm}
                onChange={handleChange}
                placeholder="SARL, SAS, Micro-entreprise..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rcs">RCS*</Label>
              <Input
                id="rcs"
                name="rcs"
                value={companyData.rcs}
                onChange={handleChange}
                placeholder="Paris B 123 456 789"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vatNumber">N° TVA Intracommunautaire*</Label>
              <Input
                id="vatNumber"
                name="vatNumber"
                value={companyData.vatNumber}
                onChange={handleChange}
                placeholder="FR12345678900"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capital">Capital social</Label>
              <Input
                id="capital"
                name="capital"
                value={companyData.capital || ""}
                onChange={handleChange}
                placeholder="10 000 €"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyData.email || ""}
                onChange={handleChange}
                placeholder="contact@entreprise.fr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={companyData.phone || ""}
                onChange={handleChange}
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isVatExempt"
              checked={companyData.isVatExempt}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isVatExempt" className="cursor-pointer">
              TVA non applicable (Article 293B du CGI)
            </Label>
          </div>
        </div>
      )}
    </div>
  );
} 