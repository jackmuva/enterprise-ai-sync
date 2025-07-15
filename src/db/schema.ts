import { v4 } from "uuid";
import { InferSelectModel } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("User", {
  id: text("id").notNull().primaryKey().$defaultFn(v4),
  email: text("email").notNull(),
});

export type User = InferSelectModel<typeof user>;

export const syncedObject = sqliteTable(
  "SyncedObject",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    externalId: text("externalId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    source: text("source").notNull(),
    objectType: text("objectType").notNull(),
    data: text("data", { mode: "json" }).notNull(),
    userId: text("userId").notNull(),
  });

export type SyncedObject = InferSelectModel<typeof syncedObject>;

export const activity = sqliteTable(
  "Activity",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    syncId: text("syncId").notNull(),
    event: text("event").notNull(),
    source: text("source").notNull(),
    objectType: text("objectType").notNull(),
    receivedAt: integer("receivedAt", { mode: "timestamp" }).notNull(),
    data: text("data", { mode: "json" }).notNull(),
    userId: text("userId").notNull(),
  }
);

export type Activity = InferSelectModel<typeof activity>;
