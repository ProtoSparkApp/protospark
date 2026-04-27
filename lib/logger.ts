export const logger = {
  isEnabled: process.env.NEXT_PUBLIC_DEBUG_LOGS === "true" || process.env.DEBUG_LOGS === "true",

  info(context: string, message: string, data?: any) {
    if (!this.isEnabled) return;
    console.log(`[INFO][${context}] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  },

  error(context: string, message: string, error?: any) {
    if (!this.isEnabled) return;
    console.error(`[ERROR][${context}] ${message}`, error);
  },

  req(context: string, payload: any) {
    if (!this.isEnabled) return;
    console.log(`[REQUEST][${context}] Sending:`, JSON.stringify(payload, null, 2));
  },

  res(context: string, data: any) {
    if (!this.isEnabled) return;
    console.log(`[RESPONSE][${context}] Received:`, JSON.stringify(data, null, 2));
  }
};
