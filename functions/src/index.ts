/**
 * Firebase Cloud Functions
 * - processScheduledMessages: runs every minute, marks scheduled messages as sent when scheduledAt <= now
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { processScheduledMessages } from "./scheduled/processScheduledMessages";

setGlobalOptions({ maxInstances: 10 });

export { processScheduledMessages };
