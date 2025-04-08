import axios from 'axios';

export async function fetchAddressFromCep(cep: string): Promise<any> {
  const viaCepUrl = `https://viacep.com.br/ws/${cep}/json/`;
  const { data } = await axios.get(viaCepUrl);

  if (data.erro) {
    throw new Error('Invalid CEP');
  }

  return data;
}