import {
  Block,
  Connection,
  ConnectionRequest,
  Like,
  Profile,
  relationshipPairKey,
} from "@/infrastructure/database/models";
import { connectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { notificationService } from "@/application/notifications/notification.service";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/error-handler";

export type ConnectionState =
  | "NONE"
  | "INTERESTED"
  | "INTERESTED_BY_OTHER"
  | "MUTUAL_INTEREST"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "CONNECTED"
  | "DECLINED"
  | "BLOCKED"
  | "REMOVED";

const INTEREST_TYPE = "INTEREST" as const;

const CONNECT_NOTE_TEMPLATES = [
  "Your profile and compatibility insights caught my interest. I'd be happy to connect.",
  "I'd love to learn more about you.",
  "Your values and interests seem aligned with mine.",
];

async function resolveDisplayName(userId: string): Promise<string> {
  const db = getMongoDb();
  const user = await db.collection("user").findOne({
    $or: [{ id: userId }, { _id: userId as never }],
  });
  if (user?.name) return String(user.name);
  const profile = await Profile.findOne({ userId }).lean();
  return profile?.name || "Someone";
}

function orderedPair(a: string, b: string) {
  return [a, b].sort() as [string, string];
}

type MemberCard = {
  userId: string;
  name: string;
  city: string | null;
  profession: string | null;
  photo: string | null;
  age: number | null;
};

export class RelationshipService {
  noteTemplates() {
    return CONNECT_NOTE_TEMPLATES;
  }

  async assertNotBlocked(userA: string, userB: string) {
    await connectMongo();
    const blocked = await Block.findOne({
      status: "ACTIVE",
      $or: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    }).lean();
    if (blocked) {
      throw new ForbiddenError("This action is not available with this member");
    }
  }

  async isBlockedEitherWay(userA: string, userB: string) {
    await connectMongo();
    return Boolean(
      await Block.findOne({
        status: "ACTIVE",
        $or: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      }).lean(),
    );
  }

  async areConnected(userA: string, userB: string) {
    await connectMongo();
    const key = relationshipPairKey(userA, userB);
    return Boolean(
      await Connection.findOne({
        pairKey: key,
        connectionStatus: "ACTIVE",
        status: "ACTIVE",
      }).lean(),
    );
  }

  async getState(
    viewerId: string,
    otherId: string,
  ): Promise<{
    state: ConnectionState;
    canMessage: boolean;
    canConnect: boolean;
    canInterest: boolean;
    canUndoInterest: boolean;
    pendingRequestId: string | null;
    requestMessage: string | null;
  }> {
    if (!otherId || otherId === viewerId) {
      throw new ValidationError("Invalid member");
    }
    await connectMongo();

    if (await this.isBlockedEitherWay(viewerId, otherId)) {
      return {
        state: "BLOCKED",
        canMessage: false,
        canConnect: false,
        canInterest: false,
        canUndoInterest: false,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    const key = relationshipPairKey(viewerId, otherId);
    const [connection, pendingRequest, declinedRequest, iSent, theySent] = await Promise.all([
      Connection.findOne({ pairKey: key, status: "ACTIVE" }).lean(),
      ConnectionRequest.findOne({
        pairKey: key,
        requestStatus: "PENDING",
        status: "ACTIVE",
      }).lean(),
      ConnectionRequest.findOne({
        pairKey: key,
        requestStatus: "DECLINED",
        status: "ACTIVE",
      })
        .sort({ respondedAt: -1 })
        .lean(),
      Like.findOne({
        fromUserId: viewerId,
        toUserId: otherId,
        type: INTEREST_TYPE,
        status: "ACTIVE",
      }).lean(),
      Like.findOne({
        fromUserId: otherId,
        toUserId: viewerId,
        type: INTEREST_TYPE,
        status: "ACTIVE",
      }).lean(),
    ]);

    if (connection?.connectionStatus === "ACTIVE") {
      return {
        state: "CONNECTED",
        canMessage: true,
        canConnect: false,
        canInterest: false,
        canUndoInterest: false,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    if (connection?.connectionStatus === "REMOVED") {
      return {
        state: "REMOVED",
        canMessage: false,
        canConnect: false,
        canInterest: true,
        canUndoInterest: false,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    if (pendingRequest) {
      const sentByMe = pendingRequest.senderId === viewerId;
      return {
        state: sentByMe ? "REQUEST_SENT" : "REQUEST_RECEIVED",
        canMessage: false,
        canConnect: false,
        canInterest: false,
        canUndoInterest: false,
        pendingRequestId: String(pendingRequest._id),
        requestMessage: pendingRequest.message || null,
      };
    }

    if (declinedRequest && declinedRequest.senderId === viewerId) {
      return {
        state: "DECLINED",
        canMessage: false,
        canConnect: Boolean(iSent && theySent),
        canInterest: !iSent,
        canUndoInterest: Boolean(iSent),
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    if (iSent && theySent) {
      return {
        state: "MUTUAL_INTEREST",
        canMessage: false,
        canConnect: true,
        canInterest: false,
        canUndoInterest: true,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    if (iSent) {
      return {
        state: "INTERESTED",
        canMessage: false,
        canConnect: false,
        canInterest: false,
        canUndoInterest: true,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    if (theySent) {
      return {
        state: "INTERESTED_BY_OTHER",
        canMessage: false,
        canConnect: false,
        canInterest: true,
        canUndoInterest: false,
        pendingRequestId: null,
        requestMessage: null,
      };
    }

    return {
      state: "NONE",
      canMessage: false,
      canConnect: false,
      canInterest: true,
      canUndoInterest: false,
      pendingRequestId: null,
      requestMessage: null,
    };
  }

  async expressInterest(fromUserId: string, toUserId: string) {
    if (!toUserId || toUserId === fromUserId) {
      throw new ValidationError("Invalid member");
    }
    await this.assertNotBlocked(fromUserId, toUserId);
    await connectMongo();

    const existing = await Like.findOneAndUpdate(
      { fromUserId, toUserId, type: INTEREST_TYPE },
      {
        $set: {
          fromUserId,
          toUserId,
          type: INTEREST_TYPE,
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true },
    ).lean();

    const reciprocal = await Like.findOne({
      fromUserId: toUserId,
      toUserId: fromUserId,
      type: INTEREST_TYPE,
      status: "ACTIVE",
    }).lean();

    const fromName = await resolveDisplayName(fromUserId);

    if (reciprocal) {
      const otherName = await resolveDisplayName(toUserId);
      await Promise.all([
        notificationService.create({
          userId: toUserId,
          type: "MUTUAL_INTEREST",
          title: "Mutual Interest",
          body: `Your interest is mutual with ${fromName}.`,
          data: { otherUserId: fromUserId, href: `/dashboard/matches/profile?id=${fromUserId}` },
        }),
        notificationService.create({
          userId: fromUserId,
          type: "MUTUAL_INTEREST",
          title: "Mutual Interest",
          body: `You and ${otherName} are both interested.`,
          data: { otherUserId: toUserId, href: `/dashboard/matches/profile?id=${toUserId}` },
        }),
      ]);
    } else {
      await notificationService.create({
        userId: toUserId,
        type: "INTEREST",
        title: "New Interest",
        body: `${fromName} is interested in getting to know you.`,
        data: { otherUserId: fromUserId, href: `/dashboard/matches/profile?id=${fromUserId}` },
      });
    }

    const state = await this.getState(fromUserId, toUserId);
    return { interest: existing, ...state };
  }

  async undoInterest(fromUserId: string, toUserId: string) {
    await connectMongo();
    const state = await this.getState(fromUserId, toUserId);
    if (
      state.state === "CONNECTED" ||
      state.state === "REQUEST_SENT" ||
      state.state === "REQUEST_RECEIVED"
    ) {
      throw new ConflictError("Withdraw the connection request or remove the connection first");
    }
    await Like.updateOne(
      { fromUserId, toUserId, type: INTEREST_TYPE },
      { $set: { status: "INACTIVE", deletedAt: new Date() } },
    );
    return this.getState(fromUserId, toUserId);
  }

  async sendConnectionRequest(senderId: string, receiverId: string, message = "") {
    if (!receiverId || receiverId === senderId) {
      throw new ValidationError("Invalid member");
    }
    await this.assertNotBlocked(senderId, receiverId);
    const state = await this.getState(senderId, receiverId);
    if (state.state === "CONNECTED") {
      throw new ConflictError("You are already connected");
    }
    if (state.state === "REQUEST_SENT") {
      throw new ConflictError("Connection request already pending");
    }
    if (state.state === "REQUEST_RECEIVED") {
      throw new ConflictError("They already sent you a request — accept it instead");
    }
    if (state.state !== "MUTUAL_INTEREST" && !(state.state === "DECLINED" && state.canConnect)) {
      throw new ForbiddenError("Connect is available after Mutual Interest");
    }

    const note = String(message || "")
      .trim()
      .slice(0, 250);
    const key = relationshipPairKey(senderId, receiverId);

    await ConnectionRequest.updateMany(
      { pairKey: key, requestStatus: "PENDING" },
      { $set: { requestStatus: "WITHDRAWN", respondedAt: new Date() } },
    );

    const request = await ConnectionRequest.create({
      senderId,
      receiverId,
      pairKey: key,
      message: note,
      requestStatus: "PENDING",
      deletedAt: null,
      status: "ACTIVE",
    } as never);
    const requestId = String((request as { _id: unknown })._id);

    const senderName = await resolveDisplayName(senderId);
    await notificationService.create({
      userId: receiverId,
      type: "CONNECTION_REQUEST",
      title: "Connection Request",
      body: `${senderName} would like to connect with you.`,
      data: {
        otherUserId: senderId,
        requestId,
        href: "/dashboard/connections",
      },
    });

    return {
      request: {
        id: requestId,
        senderId,
        receiverId,
        message: note,
        status: "PENDING",
      },
      ...(await this.getState(senderId, receiverId)),
    };
  }

  async acceptRequest(receiverId: string, requestId: string) {
    await connectMongo();
    const request = await ConnectionRequest.findById(requestId);
    if (
      !request ||
      request.receiverId !== receiverId ||
      request.requestStatus !== "PENDING" ||
      (request as { status?: string }).status !== "ACTIVE"
    ) {
      throw new NotFoundError("Connection request not found");
    }

    await this.assertNotBlocked(receiverId, request.senderId);

    await ConnectionRequest.findByIdAndUpdate(requestId, {
      $set: { requestStatus: "ACCEPTED", respondedAt: new Date() },
    });

    const [userAId, userBId] = orderedPair(request.senderId, request.receiverId);
    const connection = await Connection.findOneAndUpdate(
      { pairKey: request.pairKey },
      {
        $set: {
          userAId,
          userBId,
          pairKey: request.pairKey,
          initiatedBy: request.senderId,
          connectedAt: new Date(),
          connectionStatus: "ACTIVE",
          removedBy: null,
          removedAt: null,
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true },
    ).lean();

    const receiverName = await resolveDisplayName(receiverId);
    await notificationService.create({
      userId: request.senderId,
      type: "CONNECTION_ACCEPTED",
      title: "Connection Accepted",
      body: `${receiverName} accepted your connection request.`,
      data: {
        otherUserId: receiverId,
        href: `/dashboard/chat?with=${receiverId}`,
      },
    });

    return {
      connection,
      ...(await this.getState(receiverId, request.senderId)),
    };
  }

  async declineRequest(receiverId: string, requestId: string) {
    await connectMongo();
    const request = await ConnectionRequest.findById(requestId).lean();
    if (!request || request.receiverId !== receiverId || request.requestStatus !== "PENDING") {
      throw new NotFoundError("Connection request not found");
    }
    await ConnectionRequest.findByIdAndUpdate(requestId, {
      $set: { requestStatus: "DECLINED", respondedAt: new Date() },
    });
    return this.getState(receiverId, request.senderId);
  }

  async withdrawRequest(senderId: string, requestId: string) {
    await connectMongo();
    const request = await ConnectionRequest.findById(requestId).lean();
    if (!request || request.senderId !== senderId || request.requestStatus !== "PENDING") {
      throw new NotFoundError("Connection request not found");
    }
    await ConnectionRequest.findByIdAndUpdate(requestId, {
      $set: { requestStatus: "WITHDRAWN", respondedAt: new Date() },
    });
    return this.getState(senderId, request.receiverId);
  }

  async removeConnection(userId: string, otherUserId: string) {
    await connectMongo();
    const key = relationshipPairKey(userId, otherUserId);
    const updated = await Connection.findOneAndUpdate(
      {
        pairKey: key,
        connectionStatus: "ACTIVE",
        status: "ACTIVE",
      },
      {
        $set: {
          connectionStatus: "REMOVED",
          removedBy: userId,
          removedAt: new Date(),
        },
      },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundError("Connection not found");
    return this.getState(userId, otherUserId);
  }

  async blockUser(blockerId: string, blockedId: string, reason = "") {
    if (!blockedId || blockedId === blockerId) {
      throw new ValidationError("Invalid member");
    }
    await connectMongo();
    await Block.findOneAndUpdate(
      { blockerId, blockedId },
      {
        $set: {
          blockerId,
          blockedId,
          reason: String(reason || "").slice(0, 500),
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true },
    );

    const key = relationshipPairKey(blockerId, blockedId);
    await ConnectionRequest.updateMany(
      { pairKey: key, requestStatus: "PENDING" },
      { $set: { requestStatus: "WITHDRAWN", respondedAt: new Date() } },
    );
    await Connection.updateOne(
      { pairKey: key, connectionStatus: "ACTIVE" },
      {
        $set: {
          connectionStatus: "REMOVED",
          removedBy: blockerId,
          removedAt: new Date(),
        },
      },
    );

    return this.getState(blockerId, blockedId);
  }

  private async enrichMembers(userIds: string[]) {
    const unique = [...new Set(userIds.filter(Boolean))];
    const db = getMongoDb();
    const [profiles, users] = await Promise.all([
      Profile.find({ userId: { $in: unique } }).lean(),
      db
        .collection("user")
        .find({ $or: [{ id: { $in: unique } }, { _id: { $in: unique as never[] } }] })
        .project({ id: 1, name: 1, _id: 1 })
        .toArray(),
    ]);
    const names = new Map<string, string>();
    for (const u of users) {
      names.set(
        String((u as { id?: string }).id || u._id),
        String((u as { name?: string }).name || "Member"),
      );
    }
    const map = new Map<string, MemberCard>();
    for (const p of profiles) {
      let age: number | null = null;
      if (p.dateOfBirth) {
        const d = new Date(p.dateOfBirth);
        age = new Date().getFullYear() - d.getFullYear();
      }
      map.set(p.userId, {
        userId: p.userId,
        name: names.get(p.userId) || p.name || "Member",
        city: p.city ?? null,
        profession: p.profession ?? null,
        photo: p.photos?.find((ph) => ph.isPrimary)?.secureUrl || p.photos?.[0]?.secureUrl || null,
        age,
      });
    }
    for (const id of unique) {
      if (!map.has(id)) {
        map.set(id, {
          userId: id,
          name: names.get(id) || "Member",
          city: null,
          profession: null,
          photo: null,
          age: null,
        });
      }
    }
    return map;
  }

  async listInterests(userId: string) {
    await connectMongo();
    const [sent, received] = await Promise.all([
      Like.find({
        fromUserId: userId,
        type: INTEREST_TYPE,
        status: "ACTIVE",
      })
        .sort({ createdAt: -1 })
        .lean(),
      Like.find({
        toUserId: userId,
        type: INTEREST_TYPE,
        status: "ACTIVE",
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    const otherIds = [
      ...new Set([...sent.map((s) => s.toUserId), ...received.map((r) => r.fromUserId)]),
    ];
    const people = await this.enrichMembers(otherIds);
    const mutualIds = new Set(
      sent.filter((s) => received.some((r) => r.fromUserId === s.toUserId)).map((s) => s.toUserId),
    );

    return {
      sent: sent.map((s) => ({
        id: String(s._id),
        otherUserId: s.toUserId,
        mutual: mutualIds.has(s.toUserId),
        createdAt: s.createdAt,
        ...(people.get(s.toUserId) || { name: "Member" }),
      })),
      received: received.map((r) => ({
        id: String(r._id),
        otherUserId: r.fromUserId,
        mutual: mutualIds.has(r.fromUserId),
        createdAt: r.createdAt,
        ...(people.get(r.fromUserId) || { name: "Member" }),
      })),
      mutual: [...mutualIds].map((id) => ({
        otherUserId: id,
        ...(people.get(id) || { name: "Member" }),
      })),
    };
  }

  async listConnectionsHub(userId: string) {
    await connectMongo();
    const [interests, pendingReceived, pendingSent, connected] = await Promise.all([
      this.listInterests(userId),
      ConnectionRequest.find({
        receiverId: userId,
        requestStatus: "PENDING",
        status: "ACTIVE",
      })
        .sort({ createdAt: -1 })
        .lean(),
      ConnectionRequest.find({
        senderId: userId,
        requestStatus: "PENDING",
        status: "ACTIVE",
      })
        .sort({ createdAt: -1 })
        .lean(),
      Connection.find({
        connectionStatus: "ACTIVE",
        status: "ACTIVE",
        $or: [{ userAId: userId }, { userBId: userId }],
      })
        .sort({ connectedAt: -1 })
        .lean(),
    ]);

    const requestIds = [
      ...pendingReceived.map((r) => r.senderId),
      ...pendingSent.map((r) => r.receiverId),
      ...connected.map((c) => (c.userAId === userId ? c.userBId : c.userAId)),
    ];
    const people = await this.enrichMembers(requestIds);

    return {
      interested: interests,
      requests: {
        received: pendingReceived.map((r) => ({
          id: String(r._id),
          otherUserId: r.senderId,
          message: r.message || "",
          createdAt: r.createdAt,
          ...(people.get(r.senderId) || { name: "Member" }),
        })),
        sent: pendingSent.map((r) => ({
          id: String(r._id),
          otherUserId: r.receiverId,
          message: r.message || "",
          createdAt: r.createdAt,
          ...(people.get(r.receiverId) || { name: "Member" }),
        })),
      },
      connected: connected.map((c) => {
        const otherId = c.userAId === userId ? c.userBId : c.userAId;
        return {
          id: String(c._id),
          otherUserId: otherId,
          connectedAt: c.connectedAt,
          ...(people.get(otherId) || { name: "Member" }),
        };
      }),
      templates: CONNECT_NOTE_TEMPLATES,
    };
  }
}

export const relationshipService = new RelationshipService();
