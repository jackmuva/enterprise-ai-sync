import { createActivity, getSyncTriggerByUserIdAndSource } from "@/db/queries";
import { Activity } from "@/db/schema";
import { createParagonToken } from "@/app/actions/auth";
import { pullSyncedRecords } from "@/lib/sync";

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

//NOTE: need to have different logic for record_update and other webhook types
export async function POST(req: Request) {
	const body: SyncWebhook = await req.json();

	try {
		await createActivity({
			event: body.event,
			source: body.sync,
			objectType: body.data.model,
			receivedAt: new Date(body.data.synced_at),
			data: JSON.stringify(body.data),
			userId: body.user.id,
		});
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


