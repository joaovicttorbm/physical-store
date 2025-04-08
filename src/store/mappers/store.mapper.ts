import { Store } from '../schemas/store.schema';

export function formatStore(store: Store): any {
  return {
    storeID: store._id,
    storeName: store.storeName,
    takeOutInStore: store.takeOutInStore,
    shippingTimeInDays: store.shippingTimeInDays,
    latitude: store.latitude,
    longitude: store.longitude,
    address1: store.address1,
    address2: store.address2,
    address3: store.address3,
    city: store.city,
    district: store.district,
    state: store.state,
    type: store.type,
    country: store.country,
    postalCode: store.postalCode,
    telephoneNumber: store.telephoneNumber,
    emailAddress: store.emailAddress,
  };
}

export function buildResponse(stores: Store[]): any {
  const formattedStores = stores.map((store) => formatStore(store));

  return {
    stores: formattedStores,
  };
}