import { Schema, type Document } from "mongoose";

export const RECORD_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const USER_ROLES = [
  "MEMBER",
  "PREMIUM",
  "ASTROLOGER",
  "SUPPORT",
  "ADMIN",
  "SUPER_ADMIN",
] as const;
export type UserRoleCode = (typeof USER_ROLES)[number];

export interface SoftDeleteFields {
  deletedAt?: Date | null;
  status: RecordStatus;
}

export interface AuditFields {
  createdBy?: string | null;
  updatedBy?: string | null;
}

export type BaseDocument = Document &
  SoftDeleteFields &
  AuditFields & {
    createdAt: Date;
    updatedAt: Date;
  };

export function softDeletePlugin(schema: Schema) {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
    status: {
      type: String,
      enum: RECORD_STATUSES,
      default: "ACTIVE",
      index: true,
    },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  });

  schema.pre(
    /^find/,
    function (this: { getQuery: () => Record<string, unknown>; where: (q: object) => void }) {
      const query = this.getQuery();
      if (query.deletedAt === undefined && query.includeDeleted !== true) {
        this.where({ deletedAt: null });
      }
    },
  );
}

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(_doc: unknown, ret: Record<string, unknown>) {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
} as const;
