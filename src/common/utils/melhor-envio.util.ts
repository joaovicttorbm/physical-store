import axios from 'axios';

interface ShipmentProduct {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

interface ShipmentOptions {
  receipt: boolean;
  own_hand: boolean;
  insurance_value: number;
  reverse: boolean;
  non_commercial: boolean;
}

interface ShipmentRequest {
  from: { postal_code: string };
  to: { postal_code: string };
  products?: ShipmentProduct[];
  options?: ShipmentOptions;
  services?: string[];
  validate?: boolean;
}

export async function calculateShipment(
  shipmentRequest: ShipmentRequest,
  apiKey: string,
): Promise<any> {
  if (!apiKey) 
    throw new Error('MELHOR_ENVIO_API_KEY is required');

  const url = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

  const defaultRequest: ShipmentRequest = {
    from: { postal_code: shipmentRequest.from.postal_code },
    to: { postal_code: shipmentRequest.to.postal_code },
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
    services: ['1', '2'],
    validate: true,
  };

  const finalRequest = {
    ...defaultRequest,
    ...shipmentRequest,
    products: shipmentRequest.products || defaultRequest.products,
    options: shipmentRequest.options || defaultRequest.options,
    services: shipmentRequest.services || defaultRequest.services,
    validate: shipmentRequest.validate ?? defaultRequest.validate,
  };

  try {
    const { data } = await axios.post(
      url,
      finalRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Error calculating shipment: ${errorMessage}`);
  }
}