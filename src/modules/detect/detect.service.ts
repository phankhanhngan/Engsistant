// Detect service call to CEFR detect level server
import axios from 'axios';
import 'dotenv/config';

interface PredictResponse {
  cefr: string;
  sentence: string;
}
export const detectLevel = async (
  sentences: string[],
): Promise<PredictResponse[]> => {
  try {
    // using axios
    const response = await axios.post(`$process.env.PREDICT_SERVER_URL`, {
      sentences: sentences,
    });
    return response.data as PredictResponse[];
  } catch (error) {
    console.error('Error in detectLevel', error);
    throw error;
  }
};
