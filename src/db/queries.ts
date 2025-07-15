import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { SyncedObject, User, Activity, user, activity, syncedObject } from './schema';
import { eq, and, desc } from 'drizzle-orm';

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle({ client });

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database", error);
    throw error;
  }
}

export async function createUser(
  email: string,
) {

  try {
    return await db.insert(user).values({ email });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function getSyncedObjectByUserIdAndObjectType({ id, objectType }: { id: string, objectType: string }): Promise<Array<SyncedObject>> {
  try {
    return await db.select().from(syncedObject).where(and(eq(syncedObject.userId, id), eq(syncedObject.objectType, objectType)));
  } catch (error) {
    console.error("Failed to get user's synced objects from database", error);
    throw error;
  }
}

export async function getSyncedObjectById({ id }: { id: string, }): Promise<Array<SyncedObject>> {
  try {
    return await db.select().from(syncedObject).where(eq(syncedObject.id, id));
  } catch (error) {
    console.error("Failed to get user's synced objects from database", error);
    throw error;
  }
}


export async function createSyncedObject({
  id,
  externalId,
  createdAt,
  updatedAt,
  userId,
  data,
  source,
  objectType,
}: {
  id: string,
  externalId: string,
  createdAt: Date,
  updatedAt: Date,
  userId: string,
  data: string,
  source: string,
  objectType: string,
}) {
  const selectedSyncedObject = await db.select().from(syncedObject).where(eq(syncedObject.id, id));
  try {
    if (selectedSyncedObject.length > 0) {
      return await db
        .update(syncedObject)
        .set({
          data: data,
          updatedAt: updatedAt
        })
        .where(eq(syncedObject.id, id));
    }

    return await db.insert(syncedObject).values({
      id: id,
      externalId: externalId,
      createdAt: createdAt,
      updatedAt: updatedAt,
      userId: userId,
      data: data,
      source: source,
      objectType: objectType,
    });
  } catch (error) {
    console.error("Failed to create/update synced object in database");
    throw error;
  }
}

export async function getActivityByUserIdAndObjectType({ id, objectType }: { id: string, objectType: string }): Promise<Array<Activity>> {
  try {
    return await db.select().from(activity).where(and(eq(activity.objectType, objectType), eq(activity.userId, id)));
  } catch (error) {
    console.error("Failed to get user's activity from database", error);
    throw error;
  }
}

export async function getSyncTriggerByUserIdAndSource({ id, source }: { id: string, source: string }): Promise<Array<Activity>> {
  try {
    return await db.select().from(activity)
      .where(and(
        eq(activity.event, "sync_triggered"),
        eq(activity.source, source),
        eq(activity.userId, id)))
      .orderBy(desc(activity.receivedAt))
      .limit(1);
  } catch (error) {
    console.error("Failed to get trigger activity from database", error);
    throw error;
  }
}


export async function createActivity({
  event,
  syncId,
  source,
  objectType,
  receivedAt,
  data,
  userId,
}: {
  event: string,
  syncId: string,
  source: string,
  objectType: string,
  receivedAt: Date,
  data: string,
  userId: string,
}) {
  try {
    return await db.insert(activity).values({
      event: event,
      syncId: syncId,
      source: source,
      objectType: objectType,
      receivedAt: receivedAt,
      data: data,
      userId: userId
    }).returning();
  } catch (error) {
    console.error("Failed to create activity in database");
    throw error;
  }
}

