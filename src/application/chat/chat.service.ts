import { Chat, Message, Profile } from "@/infrastructure/database/models";
import { connectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { publishChatEvent } from "@/infrastructure/realtime/pusher";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { normalizePagination, toPaginatedResult } from "@/repositories/pagination";

function pairKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

async function resolveNames(userIds: string[]) {
  const map = new Map<string, string>();
  if (!userIds.length) return map;
  const db = getMongoDb();
  const users = await db
    .collection("user")
    .find({ $or: [{ id: { $in: userIds } }, { _id: { $in: userIds as never[] } }] })
    .project({ id: 1, name: 1, _id: 1 })
    .toArray();
  for (const u of users) {
    map.set(
      String((u as { id?: string }).id || u._id),
      String((u as { name?: string }).name || "Member"),
    );
  }
  return map;
}

export class ChatService {
  async listChats(userId: string) {
    await connectMongo();
    const chats = await Chat.find({
      participantIds: userId,
      status: "ACTIVE",
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const otherIds = chats
      .map((c) => c.participantIds.find((id) => id !== userId) || "")
      .filter(Boolean);
    const [names, profiles, unreadAgg] = await Promise.all([
      resolveNames(otherIds),
      Profile.find({ userId: { $in: otherIds } }).lean(),
      Message.aggregate([
        {
          $match: {
            chatId: { $in: chats.map((c) => String(c._id)) },
            senderId: { $ne: userId },
            readBy: { $ne: userId },
            status: "ACTIVE",
          },
        },
        { $group: { _id: "$chatId", count: { $sum: 1 } } },
      ]),
    ]);
    const photoBy = new Map(
      profiles.map((p) => [
        p.userId,
        p.photos?.find((ph) => ph.isPrimary)?.secureUrl || p.photos?.[0]?.secureUrl || null,
      ]),
    );
    const unreadBy = new Map(unreadAgg.map((u) => [String(u._id), u.count as number]));

    return chats.map((chat) => {
      const otherId = chat.participantIds.find((id) => id !== userId) || "";
      return {
        id: String(chat._id),
        otherUserId: otherId,
        name: names.get(otherId) || "Member",
        photo: photoBy.get(otherId) || null,
        preview: chat.lastMessagePreview || "",
        lastMessageAt: chat.lastMessageAt,
        unread: unreadBy.get(String(chat._id)) || 0,
      };
    });
  }

  async getOrCreateChat(userId: string, otherUserId: string) {
    if (!otherUserId || otherUserId === userId) {
      throw new ValidationError("Invalid chat participant");
    }
    await connectMongo();
    const key = pairKey(userId, otherUserId);
    const chat = await Chat.findOneAndUpdate(
      { pairKey: key },
      {
        $setOnInsert: {
          participantIds: [userId, otherUserId].sort(),
          pairKey: key,
          createdBy: userId,
          status: "ACTIVE",
        },
        $set: { deletedAt: null, status: "ACTIVE" },
      },
      { upsert: true, new: true },
    ).lean();
    return chat;
  }

  async assertParticipant(chatId: string, userId: string) {
    await connectMongo();
    const chat = await Chat.findById(chatId).lean();
    if (!chat) throw new NotFoundError("Chat not found");
    const status = (chat as { status?: string }).status;
    if (status && status !== "ACTIVE") throw new NotFoundError("Chat not found");
    if (!chat.participantIds.includes(userId)) throw new ForbiddenError("Not a chat participant");
    return chat;
  }

  async listMessages(chatId: string, userId: string, page = 1, limit = 50) {
    await this.assertParticipant(chatId, userId);
    const { skip } = normalizePagination({ page, limit });
    const [messages, total] = await Promise.all([
      Message.find({ chatId, status: "ACTIVE" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId, status: "ACTIVE" }),
    ]);
    return toPaginatedResult(messages.reverse(), total, page, limit);
  }

  async sendMessage(input: {
    chatId: string;
    senderId: string;
    body?: string;
    type?: "TEXT" | "IMAGE" | "VOICE" | "SYSTEM";
    mediaUrl?: string;
    mediaPublicId?: string;
    durationSec?: number;
    clientMessageId?: string;
  }) {
    const chat = await this.assertParticipant(input.chatId, input.senderId);
    const type = input.type || "TEXT";
    if (type === "TEXT" && !input.body?.trim()) {
      throw new ValidationError("Message body is required");
    }

    let message;
    if (input.clientMessageId) {
      message = await Message.findOneAndUpdate(
        { chatId: input.chatId, clientMessageId: input.clientMessageId },
        {
          $setOnInsert: {
            chatId: input.chatId,
            senderId: input.senderId,
            type,
            body: input.body?.trim() || "",
            mediaUrl: input.mediaUrl || null,
            mediaPublicId: input.mediaPublicId || null,
            durationSec: input.durationSec ?? null,
            readBy: [input.senderId],
            deliveredTo: [input.senderId],
            clientMessageId: input.clientMessageId,
            status: "ACTIVE",
          },
        },
        { upsert: true, new: true },
      ).lean();
    } else {
      const created = await Message.create({
        chatId: input.chatId,
        senderId: input.senderId,
        type,
        body: input.body?.trim() || "",
        mediaUrl: input.mediaUrl || null,
        mediaPublicId: input.mediaPublicId || null,
        durationSec: input.durationSec ?? null,
        readBy: [input.senderId],
        deliveredTo: [input.senderId],
      } as never);
      message = typeof created.toObject === "function" ? created.toObject() : created;
    }

    const preview =
      type === "TEXT"
        ? (input.body || "").slice(0, 140)
        : type === "IMAGE"
          ? "📷 Photo"
          : type === "VOICE"
            ? "🎤 Voice note"
            : "Update";

    await Chat.findByIdAndUpdate(input.chatId, {
      $set: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
      },
    });

    await publishChatEvent(input.chatId, "message:new", {
      message,
      chatId: input.chatId,
      participantIds: chat.participantIds,
    });

    return message;
  }

  async markRead(chatId: string, userId: string) {
    await this.assertParticipant(chatId, userId);
    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, readBy: { $ne: userId }, status: "ACTIVE" },
      { $addToSet: { readBy: userId } },
    );
    await publishChatEvent(chatId, "message:read", {
      chatId,
      userId,
      at: new Date().toISOString(),
    });
    return { ok: true };
  }

  async setTyping(chatId: string, userId: string, isTyping: boolean) {
    await this.assertParticipant(chatId, userId);
    await publishChatEvent(chatId, "typing", { chatId, userId, isTyping });
    return { ok: true };
  }

  async iceBreakers(userId: string, otherUserId: string) {
    await connectMongo();
    const [me, other] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Profile.findOne({ userId: otherUserId }).lean(),
    ]);
    const city = other?.city || "your city";
    const profession = other?.profession || "your work";
    return [
      `I noticed we both value intentional conversations — what does a peaceful weekend look like for you in ${city}?`,
      `Your work as ${profession} sounds meaningful. What drew you to that path?`,
      "I'd love to hear a family tradition that still means a lot to you.",
      me?.city
        ? `If we met for chai in ${me.city}, what's one thing you'd want me to know early?`
        : "What's one value you hope your future home always protects?",
    ];
  }
}

export const chatService = new ChatService();
