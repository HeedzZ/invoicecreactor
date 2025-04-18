"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Client, Address } from "@/types/invoice";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ClientFormProps {
  invoiceNumber: string;
  client: Client | null;
  date: Date;
  onClientChange: (client: Client | null) => void;
  onDateChange: (date: Date) => void;
}

export function ClientForm({ invoiceNumber, client, date, onClientChange, onDateChange }: ClientFormProps) {
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
    
    onClientChange(clientData);
  };

  return (
    <div className="grid gap-6 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Informations client et facture</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du client*</Label>
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
          <Label htmlFor="invoiceNumber">N° de facture*</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>Date de facture*</Label>
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

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="client-details">
          <AccordionTrigger className="text-sm font-medium">
            Détails complets du client
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={clientData.email}
                    onChange={handleChange}
                    placeholder="client@exemple.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET (si professionnel)</Label>
                  <Input
                    id="siret"
                    name="siret"
                    value={clientData.siret || ""}
                    onChange={handleChange}
                    placeholder="12345678900012"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.street">Adresse*</Label>
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
                  <Label htmlFor="address.postalCode">Code postal*</Label>
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
                  <Label htmlFor="address.city">Ville*</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="vatNumber">N° TVA Intracommunautaire</Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  value={clientData.vatNumber || ""}
                  onChange={handleChange}
                  placeholder="FR12345678900"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}