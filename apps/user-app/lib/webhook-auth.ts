import crypto from "crypto";
import { NextRequest } from "next/server";

export interface WebhookAuthResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Validates the incoming webhook request using a shared secret header (x-webhook-secret).
 * Uses constant-time cryptographic comparison (timingSafeEqual) to prevent timing attacks.
 */
export function verifyWebhookSecret(request: Request | NextRequest): WebhookAuthResult {
  const configuredSecret = process.env.BANK_WEBHOOK_SECRET;

  if (!configuredSecret) {
    console.error("[Webhook Auth] BANK_WEBHOOK_SECRET is not configured on the server");
    return {
      isValid: false,
      error: "Webhook authorization misconfigured",
      statusCode: 500,
    };
  }

  const providedSecret = request.headers.get("x-webhook-secret");

  if (!providedSecret) {
    return {
      isValid: false,
      error: "Missing x-webhook-secret header",
      statusCode: 401,
    };
  }

  // Use SHA-256 digests to ensure buffers have identical fixed lengths (32 bytes)
  // before timingSafeEqual, avoiding length-leak and length-mismatch errors.
  const configuredHash = crypto.createHash("sha256").update(configuredSecret, "utf8").digest();
  const providedHash = crypto.createHash("sha256").update(providedSecret, "utf8").digest();

  if (!crypto.timingSafeEqual(configuredHash, providedHash)) {
    return {
      isValid: false,
      error: "Invalid webhook secret",
      statusCode: 401,
    };
  }

  return { isValid: true };
}
