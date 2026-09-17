export type OrderStatus =
  | "EN_ATTENTE"
  | "CONFIRME"
  | "EN_PRODUCTION"
  | "PRET"
  | "LIVRE"
  | "ANNULE";

export type PaymentStatus =
  | "NON_PAYE"
  | "EN_ATTENTE_PAIEMENT"
  | "PAYE"
  | "REMBOURSE"
  | "ECHOUE";

export type PaymentMethod =
  | "CARTE_BANCAIRE"
  | "WAVE"
  | "ORANGE_MONEY"
  | "LIVRAISON";

export interface OrderFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  support: string;
  category: string;
  quantity: number;
  format?: string;
  description: string;
  fileUrl?: string;
  prixUnitaire: number;
  prixTotal: number;
  livraison: boolean;
  adresseLivraison?: string;
  paymentMethod: PaymentMethod;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  support: string;
  category: string;
  quantity: number;
  format?: string | null;
  description: string;
  fileUrl?: string | null;
  prixUnitaire: number;
  prixTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentRef?: string | null;
  livraison: boolean;
  adresseLivraison?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  EN_PRODUCTION: "En production",
  PRET: "Prêt",
  LIVRE: "Livré",
  ANNULE: "Annulé",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NON_PAYE: "Non payé",
  EN_ATTENTE_PAIEMENT: "En attente de paiement",
  PAYE: "Payé",
  REMBOURSE: "Remboursé",
  ECHOUE: "Échoué",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARTE_BANCAIRE: "Carte Bancaire (Stripe)",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  LIVRAISON: "Paiement à la livraison",
};
