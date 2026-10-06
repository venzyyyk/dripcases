/** Форма кейса, прокидываемая с сервера в клиентские компоненты витрины. */
export interface ClientCaseItem {
  productId: string;
  name: string;
  brand: string | null;
  price: number; // копейки
  images: string[];
  share: number; // нормированная доля выпадения внутри кейса, %
}

export interface ClientCase {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // копейки
  tag: string | null;
  warm: boolean;
  items: ClientCaseItem[];
}

/** Ответ POST /api/cases/[id]/open */
export interface OpenResult {
  product: {
    id: string;
    name: string;
    brand: string | null;
    price: number;
    images: string[];
    size: string | null;
    color: string | null;
  };
  openingId: string;
  newBalance: number;
}
