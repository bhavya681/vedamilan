import crypto from "node:crypto";

import Razorpay from "razorpay";

import { AppError } from "@/lib/utils/error-handler";
import { requireEnvValue } from "@/lib/utils/env";

export class RazorpayService {
  private client: Razorpay | null = null;

  private getClient(): Razorpay {
    if (this.client) return this.client;
    const keyId = requireEnvValue(
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      "RAZORPAY_KEY_ID",
    );
    const keySecret = requireEnvValue(process.env.RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET");
    this.client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return this.client;
  }

  async createOrder(params: {
    amountInPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    try {
      return await this.getClient().orders.create({
        amount: params.amountInPaise,
        currency: params.currency ?? "INR",
        receipt: params.receipt,
        notes: params.notes,
      });
    } catch (error) {
      throw new AppError("RAZORPAY_ORDER_FAILED", "Failed to create Razorpay order", 502, error);
    }
  }

  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const keySecret = requireEnvValue(process.env.RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET");
    const payload = `${params.orderId}|${params.paymentId}`;
    const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(params.signature);

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }
}

export const razorpayService = new RazorpayService();
