import Dexie, { type Table } from "dexie";

export interface OfflineSession {
  id: "current";
  userId: string;
  username: string;
  validUntil: number;
}

export interface OfflinePost {
  clientId: string;
  userId: string;
  remoteId?: string;
  username: string;
  caption: string;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  pending: boolean;
}

export interface OfflineImage {
  id: string;
  postClientId: string;
  blob: Blob;
  mime: string;
  name: string;
  width?: number;
  height?: number;
  order: number;
  pathname?: string;
  remoteUrl?: string;
}

export interface OutboxItem {
  id: string;
  userId: string;
  kind: string;
  entityId: string;
  createdAt: string;
  lastError?: string;
}

class OfflineDatabase extends Dexie {
  session!: Table<OfflineSession, string>;
  posts!: Table<OfflinePost, string>;
  images!: Table<OfflineImage, string>;
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super("mind-extension");
    this.version(1).stores({
      session: "id",
      posts: "clientId, userId, remoteId, pending",
      images: "id, postClientId, pathname",
      outbox: "id, userId, kind, entityId",
    });
  }
}

export const offlineDb = new OfflineDatabase();
