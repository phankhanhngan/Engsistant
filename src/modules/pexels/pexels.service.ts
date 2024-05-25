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
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png';
    return photos
      ? photos[Math.floor(Math.random() * length)]?.src?.original
      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png';
  } catch (error) {
    console.error('Error in generatePhoto', error);
    return null;
  }
};
