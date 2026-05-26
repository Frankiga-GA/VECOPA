import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
  constructor(private readonly config: ConfigService) {
    if (getApps().length) return;

    const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT');
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID') ?? 'vecopa-14fec';

    if (serviceAccountJson) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountJson) as ServiceAccount),
        projectId,
      });
      return;
    }

    initializeApp({ projectId });
  }

  verifyIdToken(token: string) {
    return getAuth().verifyIdToken(token);
  }
}

