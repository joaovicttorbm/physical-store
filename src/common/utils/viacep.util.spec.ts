import axios from 'axios';
import { fetchAddressFromCep } from './viacep.util';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchAddressFromCep', () => {
  it('should return address data for a valid CEP', async () => {
    const mockResponse = { data: { logradouro: 'Rua Exemplo', localidade: 'São Paulo', uf: 'SP' } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchAddressFromCep('01001-000');
    expect(result).toEqual(mockResponse.data);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01001-000/json/');
  });

  it('should throw an error for an invalid CEP', async () => {
    const mockResponse = { data: { erro: true } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    await expect(fetchAddressFromCep('00000-000')).rejects.toThrow('Invalid CEP');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/00000-000/json/');
  });

  it('should throw an error if the API request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(fetchAddressFromCep('01001-000')).rejects.toThrow('Network Error');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01001-000/json/');
  });
});