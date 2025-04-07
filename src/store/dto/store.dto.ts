export interface StoreDTO {
    storeID: string;
    storeName: string;
    takeOutInStore: boolean;
    shippingTimeInDays: number;
    latitude: string;
    longitude: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    district: string;
    state: string;
    type: 'PDV' | 'LOJA';
    country: string;
    postalCode: string;
    telephoneNumber: string;
    emailAddress: string;
  }
  
  export interface StoreResponse1 {
    stores: StoreDTO[];
    limit: number;
    offset: number;
    total: number;
  }
  
  export interface ValueFrete {
    prazo: string;
    codProdutoAgencia?: string;
    price: string;
    description: string;
  }
  
  export interface StoreResponse2Item {
    name: string;
    city: string;
    postalCode: string;
    type: 'PDV' | 'LOJA';
    distance: string;
    value: ValueFrete[];
  }
  
  export interface PinMap {
    position: {
      lat: string;
      lng: string;
    };
    title: string;
  }
  
  export interface StoreResponse2 {
    stores: StoreResponse2Item[];
    pins: PinMap[];
    limit: number;
    offset: number;
    total: number;
  }
  