import { pineconeService } from "@/lib/pinecone";
import { createSyncedObject, getSyncedObjectById } from "@/db/queries";
import { fileTypeFromBuffer } from "file-type";
import { Activity } from "@/db/schema";
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

interface SyncedRecords {
  data: Array<any>,
  paging: {
    totalRecords: number,
    remainingRecords: number,
    cursor: string,
    lastSeen: string,
  },
}

//NOTE: page size set to 5 without recursion for demo/testing purposes
export const pullSyncedRecords = async (user: string, syncTrigger: Activity, headers: Headers, cursor?: string): Promise<Array<string>> => {
  let erroredRecords: Array<string> = []

  const recordRequest = await fetch(`https://sync.useparagon.com/api/syncs/${syncTrigger.syncId}/records?page_size=50&${cursor ? `cursor=${cursor}` : ""}`, {
    method: "GET",
    headers: headers,
  });
  const recordResponse: SyncedRecords = await recordRequest.json();
  for (const data of recordResponse.data) {
    const indexResponse = await indexRecordContent(user, syncTrigger, headers, data);
    if (!indexResponse.success && indexResponse.erroredRecord) {
      erroredRecords.push(indexResponse.erroredRecord);
    }
  }

  if (recordResponse.data.length > 0 && recordResponse.paging.cursor) {
    let newErroredRecords: Array<string> = await pullSyncedRecords(user, syncTrigger, headers, recordResponse.paging.cursor);
    erroredRecords = erroredRecords.concat(newErroredRecords);
  }
  return erroredRecords;
}

const indexRecordContent = async (user: string, syncTrigger: Activity, headers: Headers, metadata: any): Promise<{ success: boolean, erroredRecord?: string }> => {
  try {
    await createSyncedObject({
      id: metadata.id,
      externalId: metadata.external_id,
      updatedAt: new Date(metadata.updated_at),
      createdAt: new Date(metadata.created_at),
      source: syncTrigger.source,
      objectType: syncTrigger.objectType,
      data: JSON.stringify(metadata),
      userId: user,
    });
    const contentRequest = await fetch(`https://sync.useparagon.com/api/syncs/${syncTrigger.syncId}/records/${metadata.id}/content`,
      {
        method: "GET",
        headers: headers,
      });
    const arrayBuffer = await contentRequest.arrayBuffer();
    const filetype = await fileTypeFromBuffer(arrayBuffer);
    console.log(metadata.name, filetype);

    if (filetype && ['docx', 'xlsx'].includes(filetype.ext)) {
      let text = null;
      if (filetype.ext === 'docx') {
        text = (await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })).value;
      } else if (filetype.ext === 'xlsx') {
        text = XLSX.utils.sheet_to_csv(XLSX.read(arrayBuffer, { type: "array" }));
      }
      console.log("text: ", text);

      if (text) {
        const numUpserted = await pineconeService.upsertText({
          text: text,
          namespaceName: user,
          metadata: {
            url: metadata.url,
            record_name: metadata.name,
            source: syncTrigger.source
          }
        });
        console.log("upserting to pinecone: ", numUpserted);
      }
    }
    return { success: true }
  } catch (err) {
    console.error(`[INDEX] unable to index record ${metadata.id}: ${err}`)
    return { success: false, erroredRecord: metadata.id };
  }
}
