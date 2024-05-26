// Detect service call to CEFR detect level server
import axios from 'axios';
import 'dotenv/config';

const predictServerUrl =
  process.env.PREDICT_SERVER_URL ||
  'https://9643-27-66-27-145.ngrok-free.app/predict';
interface PredictResponse {
  cefr: string;
  sentence: string;
}
export const detectLevel = async (
  sentences: string[],
): Promise<PredictResponse[]> => {
  try {
    // using axios
    const response = await axios.post(predictServerUrl, {
      sentences: sentences,
    });
    return response.data as PredictResponse[];
  } catch (error) {
    console.error('Error in detectLevel', error);
    throw error;
  }
};
