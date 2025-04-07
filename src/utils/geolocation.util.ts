import axios from 'axios';

export async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await axios.get(url);
  const location = response.data.results[0]?.geometry.location;

  if (!location) throw new Error('Endereço não encontrado');

  return { lat: location.lat, lng: location.lng };
}
