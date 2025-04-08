import axios from 'axios';
import { fetchDistances } from './google-maps.util';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchDistances', () => {
  const origins = 'Rua Exemplo, São Paulo, SP';
  const destinations = ['-23.5503099,-46.6342009', '-23.5613545,-46.6564943'];
  const apiKey = 'mock-api-key';

  it('should return distance data for valid inputs', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        rows: [
          {
            elements: [
              { status: 'OK', distance: { text: '1 km', value: 1000 } },
              { status: 'OK', distance: { text: '3.9 km', value: 3900 } },
            ],
          },
        ],
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchDistances(origins, destinations, apiKey);
    expect(result).toEqual(mockResponse.data);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origins,
      )}&destinations=${encodeURIComponent(destinations.join('|'))}&key=${apiKey}&language=pt-BR&units=metric`,
    );
  });

  it('should throw an error if the API response status is not OK', async () => {
    const mockResponse = { data: { status: 'INVALID_REQUEST' } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    await expect(fetchDistances(origins, destinations, apiKey)).rejects.toThrow('Error calculating distances');
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  it('should throw an error if the API request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(fetchDistances(origins, destinations, apiKey)).rejects.toThrow('Network Error');
    expect(mockedAxios.get).toHaveBeenCalled();
  });
});