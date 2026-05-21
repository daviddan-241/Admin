import { EventEmitter } from "events";

export type ActivityEvent =
  | {
      type: "message" | "call" | "request" | "tip";
      fanName: string;
      amount: number;
      detail: string;
      timestamp: string;
    }
  | {
      type: "new_post";
      post: Record<string, unknown>;
      timestamp: string;
    }
  | {
      type: "delete_post";
      postId: number;
      timestamp: string;
    }
  | {
      type: "sync_complete";
      platform: string;
      synced: number;
      timestamp: string;
    };

class ActivityEmitter extends EventEmitter {}
export const activityEmitter = new ActivityEmitter();
export const sseClients = new Set<(data: ActivityEvent) => void>();

activityEmitter.on("activity", (event: ActivityEvent) => {
  sseClients.forEach((send) => send(event));
});
