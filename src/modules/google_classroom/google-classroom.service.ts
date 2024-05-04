import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { google } from 'googleapis';
import crypto from 'crypto';

@Injectable()
export class GoogleClassroomService {
  private oAuth2Client;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://google.com',
    );
  }

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

  async authorize() {
    try {
      // Use the access token to authorize the user

      const scopes = [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.course-work.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials',
        'https://www.googleapis.com/auth/classroom.topics',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
        'https://www.googleapis.com/auth/classroom.addons.student',
        'https://www.googleapis.com/auth/classroom.addons.teacher',
        'https://www.googleapis.com/auth/classroom.profile.emails',
        'https://www.googleapis.com/auth/classroom.profile.photos',
      ];

      // Generate a secure random state value.
      // const state = crypto.randomBytes(16).toString('hex');

      // Generate a url that asks permissions for the Drive activity scope
      const authorizationUrl = this.oAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
         * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        // state: state,
      });
      console.log(authorizationUrl);
      // Save the credentials to the file
    } catch (err) {
      this.logger.error(
        'Calling authorize()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }

  async fetchClassroomData() {
    try {
      // Fetch data from Google Classroom API
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
