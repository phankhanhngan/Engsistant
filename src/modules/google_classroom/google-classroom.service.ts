import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { apikeys } from 'googleapis/build/src/apis/apikeys';

@Injectable()
export class GoogleClassroomService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
  async loadSavedCredentialsIfExist() {
    try {
      return google.auth.fromAPIKey(process.env.GOOGLE_API_KEY);
    } catch (err) {
      return null;
    }
  }

  async fetchClassroomData() {
    try {
      // Fetch data from Google Classroom API
      const response = await fetch(`${this.GOOGLE_CLASSROOM_API_URL}/courses`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer `,
        },
      });
      const data = await response.json();
      return data;

      // and return the data
    } catch (err) {
      this.logger.error(
        'Calling fetchClassroomData()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }
}
