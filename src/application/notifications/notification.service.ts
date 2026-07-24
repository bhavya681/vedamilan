import { Types } from "mongoose";

import { Notification } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";

const UNREAD_FILTER = {
  $or: [{ readAt: null }, { readAt: { $exists: false } }],
};

export class NotificationService {
  async list(userId: string, limit = 50) {
    await connectMongo();
    return Notification.find({ userId, status: "ACTIVE", deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async unreadCount(userId: string) {
    await connectMongo();
    return Notification.countDocuments({
      userId,
      status: "ACTIVE",
      deletedAt: null,
      ...UNREAD_FILTER,
    });
  }

  async markRead(userId: string, notificationId?: string) {
    await connectMongo();
    const now = new Date();

    if (notificationId) {
      const filter: Record<string, unknown> = {
        userId,
        status: "ACTIVE",
        deletedAt: null,
        ...UNREAD_FILTER,
      };
      if (Types.ObjectId.isValid(notificationId)) {
        filter._id = new Types.ObjectId(notificationId);
      } else {
        filter._id = notificationId;
      }
      await Notification.updateOne(filter, { $set: { readAt: now } });
    } else {
      await Notification.updateMany(
        {
          userId,
          status: "ACTIVE",
          deletedAt: null,
          ...UNREAD_FILTER,
        },
        { $set: { readAt: now } },
      );
    }

    const unread = await this.unreadCount(userId);
    return { ok: true as const, unread };
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
      readAt: null,
      status: "ACTIVE",
    });
  }

  /** Seed helpful onboarding notices for brand-new members with an empty inbox. */
  async ensureWelcome(userId: string) {
    await connectMongo();
    const count = await Notification.countDocuments({ userId, deletedAt: null });
    if (count > 0) return;
    await Notification.insertMany([
      {
        userId,
        type: "WELCOME",
        title: "Welcome to VedaMilan AI",
        body: "Complete your profile, add birth details, and generate your kundli to unlock matching and AI explanations.",
        channel: "IN_APP",
        sentAt: new Date(),
        readAt: null,
        status: "ACTIVE",
        deletedAt: null,
      },
      {
        userId,
        type: "ONBOARDING",
        title: "Generate your first kundli",
        body: "Birth details power deterministic Vedic calculations. AI only explains the results.",
        channel: "IN_APP",
        sentAt: new Date(),
        readAt: null,
        status: "ACTIVE",
        deletedAt: null,
      },
    ]);
  }
}

export const notificationService = new NotificationService();
