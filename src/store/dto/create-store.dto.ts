export interface CreateStoreDto {
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;
  latitude?: string;
  longitude?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  district: string;
  state: string;
  type: 'LOJA' | 'PDV';
  country: string;
  postalCode: string;
  telephoneNumber: string;
  emailAddress: string;
}
