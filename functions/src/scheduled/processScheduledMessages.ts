import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();

const COLLECTION = "messages";

/**
 * Runs every minute. Finds messages with status 'scheduled' and scheduledAt <= now,
 * then updates them to status 'sent' (fake dispatch).
 */
export const processScheduledMessages = onSchedule(
  { schedule: "every 1 minutes", timeZone: "America/Sao_Paulo" },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .get();

    if (snapshot.empty) {
      logger.info("No scheduled messages to process");
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { status: "sent" });
    });
    await batch.commit();
    logger.info(`Marked ${snapshot.size} message(s) as sent`);
  }
);
