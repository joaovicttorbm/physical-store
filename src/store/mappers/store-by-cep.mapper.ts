import { Store } from '../schemas/store.schema';

export function mapStoreWithDistance(
  store: Store,
  distanceText: string,
  deliveryOptions: any[],
): any {
  return {
    name: store.storeName,
    city: store.city,
    postalCode: store.postalCode,
    type: store.type,
    distance: distanceText,
    value: deliveryOptions,
    position: {
      lat: store.latitude,
      lng: store.longitude,
    },
  };
}