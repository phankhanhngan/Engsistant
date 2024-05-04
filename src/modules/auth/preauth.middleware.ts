import * as firebase from 'firebase-admin';
import * as serviceAccount from '../../../firebaseServiceAccount.json';
import { Injectable, NestMiddleware } from '@nestjs/common';
import e, { Response } from 'express';
import { UserFirebase } from './dtos/UserFirebase.dto';

const firebase_params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
  private defaultApp: any;

  constructor() {
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebase_params),
      databaseURL:
        'https://engteachinglearningassistance-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
  }

  use(req: any, res: any, next: (error?: any) => void) {
    console.log(req);

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
