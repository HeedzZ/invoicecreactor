"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Company, Address } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { BuildingIcon, PhoneIcon, MailIcon, InfoIcon, CreditCardIcon, ImageIcon, TrashIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionalField } from "@/components/ui/optional-field";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CompanyFormProps {
  company: Company | null;
  onCompanyChange: (company: Company | null) => void;
}

export function CompanyForm({ company, onCompanyChange }: CompanyFormProps) {
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
    email: "",
    phone: "",
    website: "",
    logo: ""
  };

  const [companyData, setCompanyData] = useState<Company>(company || defaultCompany);
  const [hasEmail, setHasEmail] = useState(!!companyData.email);
  const [hasPhone, setHasPhone] = useState(!!companyData.phone);
  const [hasWebsite, setHasWebsite] = useState(!!companyData.website);
  const [hasCapital, setHasCapital] = useState(!!companyData.capital);
  const [hasLogo, setHasLogo] = useState(!!companyData.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifier le parent des changements
  useEffect(() => {
    onCompanyChange(companyData);
  }, [companyData, onCompanyChange]);

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
  };

  const handleSwitchChange = (checked: boolean) => {
    setCompanyData({
      ...companyData,
      isVatExempt: checked
    });
  };

  const handleToggleEmail = (enabled: boolean) => {
    setHasEmail(enabled);
    if (!enabled) {
      setCompanyData({
        ...companyData,
        email: ""
      });
    }
  };

  const handleTogglePhone = (enabled: boolean) => {
    setHasPhone(enabled);
    if (!enabled) {
      setCompanyData({
        ...companyData,
        phone: ""
      });
    }
  };

  const handleToggleWebsite = (enabled: boolean) => {
    setHasWebsite(enabled);
    if (!enabled) {
      setCompanyData({
        ...companyData,
        website: ""
      });
    }
  };

  const handleToggleCapital = (enabled: boolean) => {
    setHasCapital(enabled);
    if (!enabled) {
      setCompanyData({
        ...companyData,
        capital: ""
      });
    }
  };

  const handleToggleLogo = (enabled: boolean) => {
    setHasLogo(enabled);
    if (!enabled) {
      setCompanyData({
        ...companyData,
        logo: ""
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille du fichier
    if (!file.type.includes('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('La taille de l\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCompanyData({
          ...companyData,
          logo: event.target.result as string
        });
        setHasLogo(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCompanyData({
      ...companyData,
      logo: ""
    });
    setHasLogo(false);
    // Réinitialiser l'input de fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="mb-8 bg-muted/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BuildingIcon className="w-5 h-5 mr-2 text-primary" />
            <CardTitle>Informations de l'entreprise</CardTitle>
          </div>

          {hasLogo && companyData.logo && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={companyData.logo} alt={companyData.name} />
              <AvatarFallback>{companyData.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <CardDescription>
          Identifiez votre entreprise (ces données seront enregistrées pour les prochaines factures)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="essential" className="mb-4">
          <TabsList className="mb-4">
            <TabsTrigger value="essential">Informations essentielles</TabsTrigger>
            <TabsTrigger value="details">Détails juridiques</TabsTrigger>
            <TabsTrigger value="optional">Informations optionnelles</TabsTrigger>
            <TabsTrigger value="brand">Identité visuelle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="essential" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Nom de l'entreprise
                </Label>
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
                <Label htmlFor="siret" className="flex items-center">
                  <span className="text-primary mr-1">*</span> SIRET
                </Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="address.street" className="flex items-center">
                <span className="text-primary mr-1">*</span> Adresse
              </Label>
              <Input
                id="address.street"
                name="address.street"
                value={companyData.address.street}
                onChange={handleChange}
                placeholder="Rue et numéro"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.postalCode" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Code postal
                </Label>
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
                <Label htmlFor="address.city" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Ville
                </Label>
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
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalForm" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Forme juridique
                </Label>
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
                <Label htmlFor="rcs" className="flex items-center">
                  <span className="text-primary mr-1">*</span> RCS
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">Registre du Commerce et des Sociétés (ex: Paris B 123 456 789)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
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
                <Label htmlFor="vatNumber" className="flex items-center">
                  <span className="text-primary mr-1">*</span> N° TVA Intracommunautaire
                </Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  value={companyData.vatNumber}
                  onChange={handleChange}
                  placeholder="FR12345678900"
                  required
                />
              </div>
              
              <OptionalField 
                label="Capital social" 
                defaultEnabled={hasCapital}
                onToggle={handleToggleCapital}
                tooltip="Obligatoire pour les sociétés (SARL, SAS, SA...)"
              >
                <Input
                  id="capital"
                  name="capital"
                  value={companyData.capital || ""}
                  onChange={handleChange}
                  placeholder="10 000 €"
                />
              </OptionalField>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isVatExempt"
                checked={companyData.isVatExempt}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isVatExempt" className="cursor-pointer">
                TVA non applicable (Article 293B du CGI)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-4 h-4 ml-1 text-muted-foreground cursor-help inline-block" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Activez cette option si votre entreprise est en franchise de TVA</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
          </TabsContent>
          
          <TabsContent value="optional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OptionalField 
                label="Email" 
                defaultEnabled={hasEmail}
                onToggle={handleToggleEmail}
                tooltip="Email professionnel de votre entreprise"
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={companyData.email || ""}
                  onChange={handleChange}
                  placeholder="contact@entreprise.fr"
                />
              </OptionalField>
              
              <OptionalField 
                label="Téléphone" 
                defaultEnabled={hasPhone}
                onToggle={handleTogglePhone}
                tooltip="Numéro de téléphone professionnel"
              >
                <Input
                  id="phone"
                  name="phone"
                  value={companyData.phone || ""}
                  onChange={handleChange}
                  placeholder="01 23 45 67 89"
                />
              </OptionalField>
            </div>
            
            <OptionalField 
              label="Site web" 
              defaultEnabled={hasWebsite}
              onToggle={handleToggleWebsite}
              tooltip="Adresse de votre site web professionnel"
            >
              <Input
                id="website"
                name="website"
                value={companyData.website || ""}
                onChange={handleChange}
                placeholder="https://www.entreprise.fr"
              />
            </OptionalField>
          </TabsContent>

          <TabsContent value="brand" className="space-y-4">
            <OptionalField 
              label="Logo de l'entreprise" 
              defaultEnabled={hasLogo}
              onToggle={handleToggleLogo}
              tooltip="Le logo apparaîtra sur vos factures"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {companyData.logo ? (
                    <div className="relative">
                      <div className="w-32 h-32 border rounded-md overflow-hidden flex items-center justify-center bg-white">
                        <img 
                          src={companyData.logo} 
                          alt="Logo entreprise" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeLogo}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border rounded-md flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs text-center">Aucun logo</span>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="logoUpload">Télécharger votre logo</Label>
                    <Input
                      id="logoUpload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format recommandé : PNG ou JPEG, de préférence avec fond transparent.<br />
                      Taille maximum : 5 Mo
                    </p>
                  </div>
                </div>
              </div>
            </OptionalField>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="flex items-center">
            <span className="text-primary mr-1">*</span> Champs obligatoires selon la réglementation française
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 