import admin, { cert, getApps, initializeApp } from "firebase-admin";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { env } from "../../Config/config.service";
import chalk from "chalk";

let messaging: Messaging | null = null;

export const initializeFirebase = (): void => {
  if (getApps().length) return;

  const keyPath = resolve(env.FIREBASE_SYSTEM_ACCOUNT); // مسار ملف جسون
  if (!existsSync(keyPath))
    throw new Error(
      `Firebase service account key file not found at path: ${keyPath}`,
    );

  try {
    const serviceAccount = JSON.parse(
      readFileSync(keyPath, "utf-8"),
    ) as admin.ServiceAccount;

    initializeApp({
      credential: cert(serviceAccount),
    });

    messaging = getMessaging();

    console.log(chalk.green(`[Firebase] Admin SDK initialized successfully`));
  } catch (error) {
    console.log(
      chalk.green(
        `[Firebase] Error initializing Admin SDK: `,
        (error as Error).message,
      ),
    );
  }
};

export const getFirebaseMessaging = (): Messaging | null => messaging;

export { admin };
