import axios from 'axios';
import { calculateShipment } from './melhor-envio.util';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('calculateShipment', () => {
  const mockApiKey = 'mock-api-key';
  const mockShipmentRequest = {
    from: { postal_code: '01001-000' },
    to: { postal_code: '02002-000' },
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

  const mockResponseData = [
    {
      id: '1',
      name: 'Correios - PAC',
      price: '15.00',
      delivery_time: { days: 5 },
    },
    {
      id: '2',
      name: 'Correios - SEDEX',
      price: '25.00',
      delivery_time: { days: 2 },
    },
  ];

  it('should calculate shipment successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponseData });

    const result = await calculateShipment(mockShipmentRequest, mockApiKey);

    expect(result).toEqual(mockResponseData);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
      mockShipmentRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
      },
    );
  });

  it('should throw an error if API key is missing', async () => {
    await expect(calculateShipment(mockShipmentRequest, '')).rejects.toThrow(
      'MELHOR_ENVIO_API_KEY is required',
    );
  });

  it('should throw an error if API returns an error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Invalid postal code' },
      },
    });

    await expect(calculateShipment(mockShipmentRequest, mockApiKey)).rejects.toThrow(
      'Error calculating shipment: Invalid postal code',
    );
  });

  it('should throw a generic error if no response is returned', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(calculateShipment(mockShipmentRequest, mockApiKey)).rejects.toThrow(
      'Error calculating shipment: Network Error',
    );
  });
});