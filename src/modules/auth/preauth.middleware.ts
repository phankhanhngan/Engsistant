import * as firebase from 'firebase-admin';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { UserFirebase } from './dtos/UserFirebase.dto';
import 'dotenv/config';

const firebase_params = {
  type: 'service_account',
  projectId: 'engteachinglearningassistance',
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
  clientC509CertUrl: process.env.FIREBASE_CLIENT_ID,
};

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
  private defaultApp: any;

  constructor() {
    console.log(firebase_params);
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebase_params),
      databaseURL:
        'https://engteachinglearningassistance-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
  }

  use(req: any, res: any, next: (error?: any) => void) {
    const token = req.body.token;
    if (token != null && token != '') {
      this.defaultApp
        .auth()
        .verifyIdToken(token)
        .then(async (decodedToken) => {
          const user: UserFirebase = {
            email: decodedToken.email,
            picture: decodedToken.picture,
            userId: decodedToken.user_id,
            name: decodedToken.name,
            iat: decodedToken.iat,
            exp: decodedToken.exp,
          };
          req.firebaseUser = user;
          next();
        })
        .catch((error) => {
          console.log('Failed to verify Firebase token', error);
          res.status(401).send('Unauthorized');
        });
    } else {
      console.log('No token found');
      next();
    }
  }

  private accessDenied(url: string, res: Response) {
    res.status(403).json({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Access Denied',
    });
  }
}
