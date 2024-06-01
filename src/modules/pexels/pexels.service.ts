import axios from 'axios';
import { randomInt } from 'crypto';

export const generatePhoto = async (search: string): Promise<string> => {
  try {
    const pexels = axios.create({
      baseURL: 'https://api.pexels.com/v1',
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    });

    const page = randomInt(1, 10);
    const perPage = 10;

    const response = await pexels.get(
      `/search?query=${search}&page=${page}&per_page=${perPage}`,
    );

    const photos = response.data?.photos;
    const length = photos?.length ?? 0;
    if (length === 0)
      return 'https://images.pexels.com/photos/4947406/pexels-photo-4947406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    return photos
      ? photos[Math.floor(Math.random() * length)]?.src?.landscape
      : 'https://images.pexels.com/photos/4947406/pexels-photo-4947406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  } catch (error) {
    console.error('Error in generatePhoto', error);
    return null;
  }
};
