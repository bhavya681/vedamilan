import { Notification } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";

export class NotificationService {
  async list(userId: string, limit = 50) {
    await connectMongo();
    return Notification.find({ userId, status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async unreadCount(userId: string) {
    await connectMongo();
    return Notification.countDocuments({
      userId,
      status: "ACTIVE",
      readAt: null,
    });
  }

  async markRead(userId: string, notificationId?: string) {
    await connectMongo();
    if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId } as Record<string, unknown>, {
        $set: { readAt: new Date() },
      });
      return { ok: true };
    }
    await Notification.updateMany(
      { userId, readAt: null, status: "ACTIVE" },
      { $set: { readAt: new Date() } },
    );
    return { ok: true };
  }

  async create(input: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channel?: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  }) {
    await connectMongo();
    return Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data || {},
      channel: input.channel || "IN_APP",
      sentAt: new Date(),
    });
  }

  /** Seed helpful onboarding notices for brand-new members with an empty inbox. */
  async ensureWelcome(userId: string) {
    await connectMongo();
    const count = await Notification.countDocuments({ userId });
    if (count > 0) return;
    await Notification.insertMany([
      {
        userId,
        type: "WELCOME",
        title: "Welcome to VedaMilan AI",
        body: "Complete your profile, add birth details, and generate your kundli to unlock matching and AI explanations.",
        channel: "IN_APP",
        sentAt: new Date(),
        status: "ACTIVE",
      },
      {
        userId,
        type: "ONBOARDING",
        title: "Generate your first kundli",
        body: "Birth details power deterministic Vedic calculations. AI only explains the results.",
        channel: "IN_APP",
        sentAt: new Date(),
        status: "ACTIVE",
      },
    ]);
  }
}

export const notificationService = new NotificationService();
