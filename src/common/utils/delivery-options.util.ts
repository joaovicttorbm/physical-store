import { Store } from 'src/store/schemas/store.schema';
import { calculateShipment } from './melhor-envio.util';

export async function getDeliveryOptions(
  store: Store,
  customerPostalCode: string,
  distanceKm: number,
  melhorEnvioApiKey: string, // Chave da API Melhor Envio
): Promise<any[]> {
  const deliveryOptions = [];

  if (store.type === 'PDV' && distanceKm <= 50) {
    // Entrega feita pela própria loja
    deliveryOptions.push({
      prazo: `${store.shippingTimeInDays} dias úteis`,
      price: 'R$ 15,00',
      description: 'Entrega feita pela própria loja',
    });
  } else {
    // Usar Melhor Envio para calcular frete
    const shipmentRequest = {
      from: { postal_code: store.postalCode },
      to: { postal_code: customerPostalCode },
      products: [
        {
          id: '1',
          width: 15,
          height: 10,
          length: 20,
          weight: 1,
          insurance_value: 0,
          quantity: 1,
        },
      ],
      options: {
        receipt: false,
        own_hand: false,
        insurance_value: 0,
        reverse: false,
        non_commercial: true,
      },
      services: ['1', '2'], // IDs dos serviços disponíveis
      validate: true,
    };

    try {
      const shipmentData = await calculateShipment(shipmentRequest, melhorEnvioApiKey);
      shipmentData.forEach((service: any) => {
        if (!service.error) {
          deliveryOptions.push({
            prazo: `${service.delivery_time} dias úteis`,
            price: `${service.currency} ${service.price}`,
          });
        }
      });
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    }
  }

  return deliveryOptions;
}
