import { pineconeService } from "@/lib/pinecone";
import { getSyncedObjectById } from "@/db/queries";
import { SyncedObject } from "@/db/schema";

interface SyncedRecords {
  data: Array<any>,
  paging: {
    total_records: number,
    remaining_records: number,
    cursor: string,
    last_seen: string,
  },
}

export const pullSyncedRecords = async (user: string, syncId: string, headers: Headers, cursor?: string): Promise<Array<string>> => {
  let erroredRecords: Array<string> = []


  const recordRequest = await fetch(process.env.MANAGED_SYNC_API + `/sync/${syncId}/records?pageSize=100&${cursor ? `cursor=${cursor}` : ""}`, {
    method: "GET",
    headers: headers,
  });
  const recordResponse: SyncedRecords = await recordRequest.json();
  for (const data of recordResponse.data) {
    const indexResponse = await indexRecordContent(user, syncId, headers, data.id);
    if (!indexResponse.success && indexResponse.erroredRecord) {
      erroredRecords.push(indexResponse.erroredRecord);
    }
  }
  if (recordResponse.paging.remaining_records > 0) {
    let newErroredRecords: Array<string> = await pullSyncedRecords(user, syncId, headers, recordResponse.paging.cursor);
    erroredRecords = erroredRecords.concat(newErroredRecords);
  }
  return erroredRecords;
}

const indexRecordContent = async (user: string, syncId: string, headers: Headers, recordId: string): Promise<{ success: boolean, erroredRecord?: string }> => {
  const contentRequest = await fetch(process.env.MANAGED_SYNC_API + `/sync/${syncId}/records/${recordId}/content`,
    {
      method: "GET",
      headers: headers,
    });
  const metadata: Array<SyncedObject> = await getSyncedObjectById({ id: recordId });
  // FIX: will need to rework when we now the schema for the content that's returned
  const contentResponse = await contentRequest.json();

  try {
    if (metadata.length > 0) {
      //@ts-ignore
      const numUpserted = pineconeService.upsertText({
        text: contentResponse as string,
        namespaceName: user,
        metadata: {
          url: metadata[0].data.url,
          record_name: metadata[0].data.name,
          source: metadata[0].source
        }
      });
      console.log(numUpserted);
      return { success: true }
    }
    return { success: false, erroredRecord: recordId };
  } catch (err) {
    console.error(`[INDEX] unable to index record ${recordId}: ${err}`)
    return { success: false, erroredRecord: recordId };
  }
}
