export interface Article {
  id: string;
  details: string;
  quantity: number;
  rate: number;
  tax: number;
  amount: number;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address?: Address;
  vatNumber?: string; // Numéro de TVA intracommunautaire
  siret?: string; // SIRET pour les clients professionnels français
}

export interface Company {
  name: string;
  address: Address;
  siret: string;
  rcs: string; // RCS (Registre du Commerce et des Sociétés)
  legalForm: string; // Forme juridique (EURL, SARL, SAS, etc.)
  capital?: string; // Capital social (pour les sociétés)
  vatNumber: string; // Numéro de TVA intracommunautaire
  isVatExempt: boolean; // Exonération de TVA (Article 293B du CGI)
  email?: string;
  phone?: string;
  website?: string;
  logo?: string; // URL ou chaîne base64 de l'image du logo
}

export interface PaymentTerms {
  daysLimit: number; // Délai de paiement (ex: 30 jours)
  method: string; // Méthode de paiement (Virement, Chèque, etc.)
  latePaymentPenalty: number; // Taux des pénalités de retard (%)
  lumpSumCompensation: number; // Indemnité forfaitaire de recouvrement (€)
  earlyPaymentDiscount?: number; // Escompte pour paiement anticipé (%)
  bankDetails?: {
    bankName: string;
    iban: string;
    bic: string;
  };
}

export interface Invoice {
  id: string;
  number: string;
  date: Date;
  client: Client;
  company: Company;
  articles: Article[];
  subtotal: number; // Total HT
  taxTotal: number; // Total TVA
  total: number; // Total TTC
  paymentTerms: PaymentTerms;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate?: Date; // Date d'échéance
  notes?: string; // Notes ou conditions particulières
}