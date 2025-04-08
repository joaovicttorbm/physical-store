import axios from 'axios';

export async function fetchDistances(
  origins: string,
  destinations: string[],
  apiKey: string,
): Promise<any> {
  const mapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origins,
  )}&destinations=${encodeURIComponent(
    destinations.join('|'),
  )}&key=${apiKey}&language=pt-BR&units=metric`;

  const { data } = await axios.get(mapsUrl);

  if (data.status !== 'OK') {
    throw new Error('Error calculating distances');
  }

  return data;
}