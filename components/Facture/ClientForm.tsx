"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, MapPinIcon, MailIcon, BuildingIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Client, Address } from "@/types/invoice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OptionalField } from "@/components/ui/optional-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClientFormProps {
  invoiceNumber: string;
  client: Client | null;
  date: Date;
  onClientChange: (client: Client | null) => void;
  onDateChange: (date: Date) => void;
  onInvoiceNumberChange?: (invoiceNumber: string) => void;
}

export function ClientForm({ invoiceNumber, client, date, onClientChange, onDateChange, onInvoiceNumberChange }: ClientFormProps) {
  const initialClientData: Client = client || {
    id: "temp",
    name: "",
    email: "",
    address: {
      street: "",
      postalCode: "",
      city: "",
      country: "France"
    },
    vatNumber: "",
    siret: ""
  };

  const [clientData, setClientData] = useState<Client>(initialClientData);
  const [hasEmail, setHasEmail] = useState(!!initialClientData.email);
  const [hasSiret, setHasSiret] = useState(!!initialClientData.siret);
  const [hasVatNumber, setHasVatNumber] = useState(!!initialClientData.vatNumber);

  useEffect(() => {
    onClientChange(clientData);
  }, [clientData, onClientChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setClientData({
        ...clientData,
        [parent]: {
          ...(clientData as any)[parent],
          [child]: value
        }
      });
    } else {
      setClientData({
        ...clientData,
        [name]: value
      });
    }
  };

  const handleInvoiceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onInvoiceNumberChange) {
      onInvoiceNumberChange(e.target.value);
    }
  };

  const handleToggleEmail = (enabled: boolean) => {
    setHasEmail(enabled);
    if (!enabled) {
      setClientData({
        ...clientData,
        email: ""
      });
    }
  };

  const handleToggleSiret = (enabled: boolean) => {
    setHasSiret(enabled);
    if (!enabled) {
      setClientData({
        ...clientData,
        siret: ""
      });
    }
  };

  const handleToggleVatNumber = (enabled: boolean) => {
    setHasVatNumber(enabled);
    if (!enabled) {
      setClientData({
        ...clientData,
        vatNumber: ""
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-primary" />
          <CardTitle>Informations client et facture</CardTitle>
        </div>
        <CardDescription>
          Ajoutez les informations du destinataire de la facture
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="required" className="mb-4">
          <TabsList className="mb-4">
            <TabsTrigger value="required">Champs obligatoires</TabsTrigger>
            <TabsTrigger value="optional">Champs optionnels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="required" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Nom du client
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={clientData.name}
                  onChange={handleChange}
                  placeholder="Nom du client"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="flex items-center">
                  <span className="text-primary mr-1">*</span> N° de facture
                </Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceNumber}
                  onChange={handleInvoiceNumberChange}
                  placeholder="INV-000001"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <span className="text-primary mr-1">*</span> Date de facture
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "d MMMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && onDateChange(date)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
                <Label htmlFor="address.street" className="flex items-center">
                  <span className="text-primary mr-1">*</span> Adresse complète
                </Label>
              </div>
              <Input
                id="address.street"
                name="address.street"
                value={clientData.address?.street || ""}
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
                  value={clientData.address?.postalCode || ""}
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
                  value={clientData.address?.city || ""}
                  onChange={handleChange}
                  placeholder="Paris"
                  required
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="optional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OptionalField 
                label="Email du client" 
                defaultEnabled={hasEmail}
                onToggle={handleToggleEmail}
                tooltip="Pratique pour envoyer la facture directement au client"
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientData.email}
                  onChange={handleChange}
                  placeholder="client@exemple.com"
                />
              </OptionalField>
              
              <OptionalField 
                label="SIRET" 
                defaultEnabled={hasSiret}
                onToggle={handleToggleSiret}
                tooltip="Obligatoire pour les clients professionnels en France"
              >
                <Input
                  id="siret"
                  name="siret"
                  value={clientData.siret || ""}
                  onChange={handleChange}
                  placeholder="12345678900012"
                />
              </OptionalField>
            </div>
            
            <OptionalField 
              label="N° TVA Intracommunautaire" 
              defaultEnabled={hasVatNumber}
              onToggle={handleToggleVatNumber}
              tooltip="Nécessaire pour les clients professionnels de l'UE"
            >
              <Input
                id="vatNumber"
                name="vatNumber"
                value={clientData.vatNumber || ""}
                onChange={handleChange}
                placeholder="FR12345678900"
              />
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