import { pineconeService } from "@/lib/pinecone";
import { getSyncedObjectById, getSyncTriggerByUserIdAndSource } from "@/db/queries";
import { Activity, SyncedObject } from "@/db/schema";
import { createParagonToken } from "@/app/actions/auth";

interface SyncWebhook {
	event: string,
	sync: string,
	user: {
		id: string
	},
	data: {
		model: string,
		synced_at: string,
		num_records: number
	}
}

export async function POST(req: Request) {
	const body: SyncWebhook = await req.json();

	try {
		const trigger: Array<Activity> = await getSyncTriggerByUserIdAndSource({ id: body.user.id, source: body.sync });
		const paragonToken = await createParagonToken(body.user.id);
		const headers = new Headers();
		headers.append("Authorization", `Bearer ${paragonToken}`);
		headers.append("Content-Type", "application/json");

		const erroredRecords = await pullSyncedRecords(body.user.id, trigger[0].id, headers);
		return Response.json({
			status: 200,
			erroredRecords: erroredRecords
		});
	} catch (err) {
		return Response.json({
			status: 500,
			message: err
		});
	}
}

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
		// WARNING: token in header may expire, may be worth having a refresh token method
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
			pineconeService.upsertText({ text: contentResponse as string, namespaceName: user, metadata: { url: metadata[0].data.url, record_name: metadata[0].data.name } });
			return { success: true }
		}
		return { success: false, erroredRecord: recordId };
	} catch (err) {
		console.error(`[INDEX] unable to index record ${recordId}: ${err}`)
		return { success: false, erroredRecord: recordId };
	}
}
