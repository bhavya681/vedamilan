import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const chatSchema = new Schema(
  {
    participantIds: { type: [String], required: true, index: true },
    pairKey: { type: String, required: true, unique: true },
    lastMessageAt: { type: Date, default: null, index: true },
    lastMessagePreview: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  baseSchemaOptions,
);

softDeletePlugin(chatSchema);
chatSchema.index({ participantIds: 1, lastMessageAt: -1 });

export type ChatDocument = InferSchemaType<typeof chatSchema> & { _id: Schema.Types.ObjectId };
export const Chat =
  (models.Chat as Model<ChatDocument>) || model<ChatDocument>("Chat", chatSchema, "chats");

const messageSchema = new Schema(
  {
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "VOICE", "SYSTEM"],
      default: "TEXT",
    },
    body: { type: String, default: "" },
    mediaUrl: { type: String, default: null },
    mediaPublicId: { type: String, default: null },
    durationSec: { type: Number, default: null },
    readBy: { type: [String], default: [] },
    deliveredTo: { type: [String], default: [] },
    clientMessageId: { type: String, default: null },
  },
  baseSchemaOptions,
);

softDeletePlugin(messageSchema);
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, clientMessageId: 1 }, { unique: true, sparse: true });

export type MessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Message =
  (models.Message as Model<MessageDocument>) ||
  model<MessageDocument>("Message", messageSchema, "messages");
