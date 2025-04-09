import { Store } from '../schemas/store.schema';
import { DELIVERY_OPTIONS } from '../../common/constants/delivery-options.constant';

export function mapStoreWithDistance(store: Store, element: any): any {
  if (element.status !== 'OK') return null;

  const distanceKm = element.distance.value / 1000;
  if (distanceKm > 100) return null;

  const distanceText = element.distance.text;
  const value = [];

  if (store.type === 'PDV') {
    if (distanceKm <= 50) {
      value.push({
        prazo: `${store.shippingTimeInDays} dias úteis`,
        price: DELIVERY_OPTIONS.PDV.price,
        description: DELIVERY_OPTIONS.PDV.description,
      });
    } else {
      value.push(
        {
          prazo: `${store.shippingTimeInDays} dias úteis`,
          codProdutoAgencia: DELIVERY_OPTIONS.LOJA.sedex.codProdutoAgencia,
          price: 'R$ 27,00',
          description: DELIVERY_OPTIONS.LOJA.sedex.description,
        },
        {
          prazo: `${store.shippingTimeInDays + 2} dias úteis`,
          codProdutoAgencia: DELIVERY_OPTIONS.LOJA.pac.codProdutoAgencia,
          price: 'R$ 25,50',
          description: DELIVERY_OPTIONS.LOJA.pac.description,
        },
      );
    }
  } else if (store.type === 'LOJA') {
    value.push(
      {
        prazo: `${store.shippingTimeInDays} dias úteis`,
        codProdutoAgencia: DELIVERY_OPTIONS.LOJA.sedex.codProdutoAgencia,
        price: 'R$ 27,00',
        description: DELIVERY_OPTIONS.LOJA.sedex.description,
      },
      {
        prazo: `${store.shippingTimeInDays + 2} dias úteis`,
        codProdutoAgencia: DELIVERY_OPTIONS.LOJA.pac.codProdutoAgencia,
        price: 'R$ 25,50',
        description: DELIVERY_OPTIONS.LOJA.pac.description,
      },
    );
  }

  return {
    name: store.storeName,
    city: store.city,
    postalCode: store.postalCode,
    type: store.type,
    distance: distanceText,
    value,
    position: {
      lat: store.latitude,
      lng: store.longitude,
    },
  };
}