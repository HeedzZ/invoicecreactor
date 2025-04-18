"use client";

import { useState, useRef } from "react";
import { ArticleTable } from "@/components/Facture/ArticleTable";
import { ClientForm } from "@/components/Facture/ClientForm";
import { CompanyForm } from "@/components/Facture/CompanyForm";
import { PaymentTermsForm } from "@/components/Facture/PaymentTermsForm";
import { InvoiceSummary } from "@/components/Facture/InvoiceSummary";
import { Article, Client, Company, PaymentTerms, Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, Send, AlertCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Déclarer l'interface pour window.appConfig
declare global {
  interface Window {
    appConfig?: {
      n8nBaseUrl: string;
      invoiceWebhookPath: string;
      invoiceWebhookUrl: string;
      webhookFullUrl: string;
    };
    n8nWebhookUrl?: string;
  }
}

// Fonction sécurisée pour accéder aux variables d'environnement côté client
const getEnvVar = (key: string, defaultValue: string): string => {
  // Vérifie si process.env est défini et si la clé existe
  if (typeof process !== 'undefined' && 
      process.env && 
      typeof process.env[key] === 'string') {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// URL de base pour n8n, avec une valeur par défaut
const getN8nUrl = (path: string = ''): string => {
  // Vérifier si la configuration globale est disponible
  if (typeof window !== 'undefined' && window.appConfig) {
    console.log('🔎 Utilisation de la configuration globale pour n8n');
    if (!path) return window.appConfig.n8nBaseUrl;
    
    // Si on demande l'URL du webhook pour les factures
    if (path === 'webhook/invoice') {
      return window.appConfig.invoiceWebhookUrl;
    }
    
    // Pour tout autre chemin
    const baseUrl = window.appConfig.n8nBaseUrl;
    const separator = baseUrl.endsWith('/') ? '' : '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}${separator}${cleanPath}`;
  }
  
  // Fallback: utiliser la variable d'environnement ou une valeur par défaut
  const baseUrl = getEnvVar('NEXT_PUBLIC_N8N_WEBHOOK_URL', 'http://localhost:5678');
  if (!path) return baseUrl;
  
  // Si l'URL se termine déjà par le chemin, ne pas l'ajouter à nouveau
  if (baseUrl.endsWith(path)) return baseUrl;
  
  // S'assurer que l'URL a un '/' à la fin si nécessaire
  const separator = baseUrl.endsWith('/') ? '' : '/';
  // S'assurer que le chemin ne commence pas par un '/' si l'URL se termine par un '/'
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${baseUrl}${separator}${cleanPath}`;
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

  const getNextInvoiceNumber = () => {
    return "INV-000008";
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    // Vérification des champs obligatoires
    if (!client) {
      errors.push("Informations client manquantes");
    } else {
      if (!client.name) errors.push("Nom du client manquant");
      if (!client.address?.street) errors.push("Adresse du client manquante");
      if (!client.address?.postalCode) errors.push("Code postal du client manquant");
      if (!client.address?.city) errors.push("Ville du client manquante");
    }
    
    if (!company) {
      errors.push("Informations de l'entreprise manquantes");
    } else {
      if (!company.name) errors.push("Nom de l'entreprise manquant");
      if (!company.siret) errors.push("SIRET de l'entreprise manquant");
      if (!company.address.street) errors.push("Adresse de l'entreprise manquante");
      if (!company.vatNumber) errors.push("Numéro de TVA intracommunautaire manquant");
      if (!company.rcs) errors.push("Numéro RCS manquant");
      if (!company.legalForm) errors.push("Forme juridique manquante");
    }
    
    if (!paymentTerms) {
      errors.push("Conditions de paiement manquantes");
    }
    
    if (articles.length === 0) {
      errors.push("Aucun article ou prestation ajouté");
    } else {
      // Vérifier que chaque article a une description, une quantité et un prix
      const invalidArticles = articles.filter(article => 
        !article.details || article.quantity <= 0 || article.rate <= 0
      );
      
      if (invalidArticles.length > 0) {
        errors.push("Certains articles sont incomplets (description, quantité ou prix manquant)");
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generatePDF = async (): Promise<string> => {
    // Vérifier que toutes les données nécessaires sont présentes
    if (!client || !company || !paymentTerms) {
      throw new Error("Données manquantes pour générer le PDF");
    }
    
    // Créer le document PDF
    const doc = new jsPDF();
    
    // Informations de l'émetteur (en-tête)
    doc.setFontSize(10);
    doc.text(company.name, 20, 20);
    doc.text(company.address.street, 20, 25);
    doc.text(`${company.address.postalCode} ${company.address.city}`, 20, 30);
    doc.text(`SIRET : ${company.siret}`, 20, 35);
    doc.text(`${company.legalForm} - RCS ${company.rcs}`, 20, 40);
    doc.text(`N° TVA : ${company.vatNumber}`, 20, 45);
    
    // Titre de la facture
    doc.setFontSize(18);
    doc.text("FACTURE", 105, 60, { align: "center" });
    
    // Informations de la facture
    doc.setFontSize(10);
    doc.text(`N° ${getNextInvoiceNumber()}`, 150, 70);
    doc.text(`Date : ${format(date, "d MMMM yyyy", { locale: fr })}`, 150, 75);
    doc.text(`Échéance : ${format(addDays(date, paymentTerms.daysLimit), "d MMMM yyyy", { locale: fr })}`, 150, 80);
    
    // Informations du client
    doc.text("FACTURER À :", 20, 70);
    doc.text(client.name, 20, 75);
    
    // S'assurer que client.address existe avant d'accéder à ses propriétés
    if (client.address) {
      doc.text(client.address.street, 20, 80);
      doc.text(`${client.address.postalCode} ${client.address.city}`, 20, 85);
    }
    
    if (client.siret) doc.text(`SIRET : ${client.siret}`, 20, 90);
    if (client.vatNumber) doc.text(`N° TVA : ${client.vatNumber}`, 20, 95);
    
    // Tableau des articles
    const tableColumn = ["Description", "Quantité", "Prix unitaire HT", "TVA", "Total TTC"];
    const tableRows = articles.map(article => {
      // S'assurer que les valeurs numériques sont bien des nombres
      const quantity = Number(article.quantity);
      const rate = Number(article.rate);
      const tax = Number(article.tax);
      
      // Calcul avec les valeurs converties
      const priceHT = quantity * rate;
      const taxAmount = priceHT * (tax / 100);
      
      return [
        article.details,
        quantity.toString(),
        `${rate.toFixed(2)} €`,
        company.isVatExempt ? "N/A" : `${tax}%`,
        `${(priceHT + taxAmount).toFixed(2)} €`
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [60, 60, 60] }
    });
    
    // Position Y après le tableau
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    
    // Totaux
    doc.setFontSize(10);
    doc.text("Total HT :", 130, finalY + 10);
    doc.text(`${subtotal.toFixed(2)} €`, 170, finalY + 10, { align: "right" });
    
    if (!company.isVatExempt) {
      doc.text("Total TVA :", 130, finalY + 15);
      doc.text(`${taxTotal.toFixed(2)} €`, 170, finalY + 15, { align: "right" });
    }
    
    doc.setFontSize(12);
    doc.text("Total TTC :", 130, finalY + 25);
    doc.text(`${total.toFixed(2)} €`, 170, finalY + 25, { align: "right" });
    
    // Conditions de paiement
    doc.setFontSize(9);
    doc.text("Conditions de paiement :", 20, finalY + 40);
    doc.text(`Paiement par ${paymentTerms.method} à ${paymentTerms.daysLimit} jours`, 20, finalY + 45);
    doc.text(`Pénalités de retard : ${paymentTerms.latePaymentPenalty}% - Indemnité forfaitaire : ${paymentTerms.lumpSumCompensation}€`, 20, finalY + 50);
    
    if (paymentTerms.method === "Virement bancaire" && paymentTerms.bankDetails) {
      doc.text("Coordonnées bancaires :", 20, finalY + 60);
      doc.text(`IBAN : ${paymentTerms.bankDetails.iban}`, 20, finalY + 65);
      doc.text(`BIC : ${paymentTerms.bankDetails.bic}`, 20, finalY + 70);
    }
    
    // Mention légale TVA
    if (company.isVatExempt) {
      doc.setFontSize(8);
      doc.text("TVA non applicable, article 293B du Code Général des Impôts.", 105, finalY + 85, { align: "center" });
    }
    
    // Convertir le PDF en URL data
    return doc.output('datauristring');
  };

  // Fonction pour tester la connexion à n8n
  const testN8nConnection = async () => {
    setIsTestingConnection(true);
    console.log('🔄 Début du test de connexion à n8n...');
    
    try {
      // Récupérer l'URL du webhook directement
      let webhookUrl = '';
      
      // Vérifie si window est défini (côté client) et si l'URL est disponible
      if (typeof window !== 'undefined' && window.n8nWebhookUrl) {
        webhookUrl = window.n8nWebhookUrl;
        console.log('🔎 Utilisation de l\'URL du webhook depuis la variable globale:', webhookUrl);
      } else {
        // Fallback à l'URL en dur si la variable globale n'est pas disponible
        webhookUrl = 'https://yannmti.app.n8n.cloud/webhook-test/a958d501-dee4-49ab-a4cb-f665c8069626';
        console.log('🔎 Utilisation de l\'URL du webhook en dur:', webhookUrl);
      }
      
      // Test simple avec fetch
      console.log('🔄 Test avec fetch...');
      const testPayload = { 
        test: true, 
        timestamp: Date.now(),
        message: "Test de connexion depuis l'application de facturation" 
      };
      
      console.log('📦 Payload de test:', JSON.stringify(testPayload, null, 2));
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log('📥 Statut de la réponse de test:', response.status, response.statusText);
      
      // Lire la réponse en texte
      const responseText = await response.text();
      console.log('📥 Corps de la réponse:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      if (!response.ok) {
        throw new Error(`Erreur de connexion: ${response.status} ${response.statusText}`);
      }
      
      alert('✅ Connexion à n8n réussie !');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur de connexion à n8n:', error);
      alert(`❌ Erreur de connexion à n8n: ${error.message}`);
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fonction pour envoyer la facture à n8n
  const sendInvoiceToN8n = async (invoiceData: Invoice, pdfBase64?: string): Promise<boolean> => {
    try {
      // Récupérer l'URL du webhook directement
      let webhookUrl = '';
      
      // Vérifie si window est défini (côté client) et si l'URL est disponible
      if (typeof window !== 'undefined' && window.n8nWebhookUrl) {
        webhookUrl = window.n8nWebhookUrl;
        console.log('🔎 Utilisation de l\'URL du webhook depuis la variable globale:', webhookUrl);
      } else {
        // Fallback à l'URL en dur si la variable globale n'est pas disponible
        webhookUrl = 'https://yannmti.app.n8n.cloud/webhook-test/a958d501-dee4-49ab-a4cb-f665c8069626';
        console.log('🔎 Utilisation de l\'URL du webhook en dur:', webhookUrl);
      }
      
      // Préparation des données d'articles avec conversion explicite des valeurs numériques
      const articlesData = invoiceData.articles.map(article => ({
        id: article.id,
        details: article.details,
        quantity: Number(article.quantity),
        rate: Number(article.rate),
        tax: Number(article.tax),
        amount: Number(article.amount)
      }));
      
      // Création d'un payload complet avec toutes les informations
      const completeInvoice = {
        // Informations de base de la facture
        id: invoiceData.id,
        number: invoiceData.number,
        date: format(invoiceData.date, "yyyy-MM-dd"),
        status: invoiceData.status,
        
        // Informations client complètes
        client: {
          id: invoiceData.client.id,
          name: invoiceData.client.name,
          email: invoiceData.client.email,
          address: invoiceData.client.address,
          vatNumber: invoiceData.client.vatNumber,
          siret: invoiceData.client.siret
        },
        
        // Informations entreprise complètes
        company: {
          name: invoiceData.company.name,
          address: invoiceData.company.address,
          siret: invoiceData.company.siret,
          rcs: invoiceData.company.rcs,
          legalForm: invoiceData.company.legalForm,
          capital: invoiceData.company.capital,
          vatNumber: invoiceData.company.vatNumber,
          isVatExempt: invoiceData.company.isVatExempt,
          email: invoiceData.company.email,
          phone: invoiceData.company.phone
        },
        
        // Articles convertis en nombres
        articles: articlesData,
        
        // Informations de paiement
        paymentTerms: {
          daysLimit: Number(invoiceData.paymentTerms.daysLimit),
          method: invoiceData.paymentTerms.method,
          latePaymentPenalty: Number(invoiceData.paymentTerms.latePaymentPenalty),
          lumpSumCompensation: Number(invoiceData.paymentTerms.lumpSumCompensation),
          earlyPaymentDiscount: invoiceData.paymentTerms.earlyPaymentDiscount 
            ? Number(invoiceData.paymentTerms.earlyPaymentDiscount) 
            : undefined,
          bankDetails: invoiceData.paymentTerms.bankDetails
        },
        
        // Totaux
        subtotal: Number(invoiceData.subtotal),
        taxTotal: Number(invoiceData.taxTotal),
        total: Number(invoiceData.total),
        
        // Date d'échéance
        dueDate: invoiceData.dueDate ? format(invoiceData.dueDate, "yyyy-MM-dd") : undefined,
        notes: invoiceData.notes
      };
      
      // Préparation du payload final
      const payload = { 
        invoice: completeInvoice,
        hasPdf: !!pdfBase64,
        timestamp: Date.now()
      };
      
      console.log('📤 Tentative d\'envoi à n8n:', webhookUrl);
      console.log('📦 Envoi des données complètes de la facture');
      
      // Envoi de la requête
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Statut de la réponse:', response.status, response.statusText);
      
      // Traitement de la réponse
      const responseText = await response.text();
      console.log('📥 Corps de la réponse:', responseText.substring(0, 200));
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
      // Si PDF disponible et première requête réussie, envoyer le PDF séparément
      if (pdfBase64 && response.ok) {
        console.log('📄 Envoi du PDF...');
        try {
          const pdfPayload = {
            invoiceId: invoiceData.id,
            invoiceNumber: invoiceData.number,
            pdf: pdfBase64.split(',')[1] || pdfBase64,
            timestamp: Date.now()
          };
          
          const pdfResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfPayload)
          });
          
          console.log('📄 Statut de l\'envoi du PDF:', pdfResponse.status);
          
          if (!pdfResponse.ok) {
            console.warn('⚠️ L\'envoi du PDF a échoué, mais les données de la facture ont été envoyées');
          }
        } catch (pdfError) {
          console.warn('⚠️ Erreur lors de l\'envoi du PDF:', pdfError);
        }
      }
      
      alert('Facture envoyée avec succès à n8n !');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi à n8n:', error);
      console.error('Détails de l\'erreur:', error.message);
      alert(`Erreur lors de l'envoi à n8n: ${error.message}`);
      return false;
    }
  };

  const handleSendInvoice = async () => {
    // Valider le formulaire
    if (!validateForm()) {
      // Faire défiler jusqu'à la première erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setPdfUrl(null);
    
    try {
      // Vérifier que articles contient des objets valides
      if (articles.some(article => 
        typeof article.rate !== 'number' || 
        typeof article.quantity !== 'number' ||
        typeof article.tax !== 'number'
      )) {
        console.log('Conversion des données numériques des articles...');
        // Convertir les articles pour s'assurer que les propriétés numériques sont bien des nombres
        const convertedArticles = articles.map(article => ({
          ...article,
          quantity: Number(article.quantity),
          rate: Number(article.rate),
          tax: Number(article.tax),
          amount: Number(article.amount),
        }));
        
        setArticles(convertedArticles);
        console.log('Articles convertis:', convertedArticles);
      }
      
      // Créer l'objet facture complet
      const invoiceData: Invoice = {
        id: "temp-" + Date.now(),
        number: getNextInvoiceNumber(),
        date: date,
        client: client!,
        company: company!,
        articles: articles.map(article => ({
          ...article,
          quantity: Number(article.quantity),
          rate: Number(article.rate),
          tax: Number(article.tax),
          amount: Number(article.amount),
        })),
        subtotal: Number(subtotal),
        taxTotal: Number(taxTotal),
        total: Number(total),
        paymentTerms: paymentTerms!,
        status: 'draft',
        dueDate: addDays(date, paymentTerms?.daysLimit || 30)
      };
      
      // Générer le PDF
      const pdfDataUrl = await generatePDF();
      setPdfUrl(pdfDataUrl);
      
      // Envoyer à n8n
      const sent = await sendInvoiceToN8n(invoiceData, pdfDataUrl);
      
      if (sent) {
        alert('Facture envoyée avec succès à n8n !');
      }
    } catch (error: any) {
      console.error('❌ ERREUR LORS DE LA GÉNÉRATION DU PDF:', error);
      alert(`Erreur lors de la génération du PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      ref={formRef} 
      className="container mx-auto py-8 space-y-8" 
      onSubmit={(e) => e.preventDefault()}
      suppressHydrationWarning
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs de validation</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <CompanyForm
          company={company}
          onCompanyChange={setCompany}
        />
        
        <ClientForm
          invoiceNumber={getNextInvoiceNumber()}
          client={client}
          date={date}
          onClientChange={setClient}
          onDateChange={setDate}
        />
        
        <PaymentTermsForm
          paymentTerms={paymentTerms}
          onPaymentTermsChange={setPaymentTerms}
        />

        <ArticleTable 
          articles={articles} 
          onChange={setArticles}
          isVatExempt={company?.isVatExempt || false}
          onSubtotalChange={setSubtotal}
          onTaxTotalChange={setTaxTotal}
          onTotalChange={setTotal}
        />

        <div className="mt-6 border-t pt-6">
          <InvoiceSummary
            subtotal={subtotal}
            taxTotal={taxTotal}
            total={total}
            date={date}
            daysLimit={paymentTerms?.daysLimit || 30}
            isVatExempt={company?.isVatExempt || false}
          />
        </div>

        {/* Affichage du PDF si disponible et visible */}
        {pdfUrl && showPdfPreview && (
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Aperçu de la facture</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPdfPreview(false)}
              >
                Fermer l'aperçu
              </Button>
            </div>
            <div className="w-full h-[600px] border rounded-md overflow-hidden">
              <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <p>
                  Votre navigateur ne peut pas afficher le PDF directement.{" "}
                  <a href={pdfUrl} target="_blank" rel="noreferrer">
                    Cliquez ici pour l'ouvrir
                  </a>
                </p>
              </object>
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            * Champs obligatoires
          </div>
          <div className="space-x-4">
            <Button 
              variant="outline"
              onClick={testN8nConnection}
              disabled={isTestingConnection || isLoading}
            >
              {isTestingConnection ? 'Test en cours...' : 'Tester connexion n8n'}
            </Button>
            
            {pdfUrl && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                >
                  {showPdfPreview ? 'Masquer le PDF' : 'Voir aperçu'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(pdfUrl, '_blank')}
                >
                  Voir dans un nouvel onglet
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Créer un lien temporaire pour le téléchargement
                    const a = document.createElement('a');
                    a.href = pdfUrl;
                    a.download = `facture-${getNextInvoiceNumber()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  Télécharger le PDF
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                // Sauvegarder comme brouillon (ici, on simule juste)
                if (validateForm()) {
                  alert("Facture enregistrée comme brouillon");
                }
              }}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer comme brouillon
            </Button>
            <Button 
              onClick={handleSendInvoice}
              disabled={isLoading}
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Traitement en cours...' : 'Créer la facture'}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}