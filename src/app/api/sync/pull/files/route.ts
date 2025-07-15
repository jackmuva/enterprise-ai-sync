import { createActivity, getSyncTriggerByUserIdAndSource } from "@/db/queries";
import { Activity } from "@/db/schema";
import { createParagonToken } from "@/app/actions/auth";
import { pullSyncedRecords } from "@/lib/sync";
import { userWithToken } from "@/app/actions/auth";

interface FilePull {
	event: string,
	sync: string,
	data: any,
	objectType: string,
}

export async function POST(req: Request) {
	const body: FilePull = await req.json();
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	try {
		const trigger: Array<Activity> = await getSyncTriggerByUserIdAndSource({ id: session.user.email, source: body.sync });
		if (trigger.length === 0) {
			console.error("Unable to find Sync Trigger");
		}
		console.log(trigger);

		await createActivity({
			event: body.event,
			syncId: trigger[0].syncId,
			source: body.sync,
			objectType: body.objectType,
			receivedAt: new Date(),
			data: JSON.stringify(body.data),
			userId: session.user.email,
		});
		const paragonToken = await createParagonToken(session.user.email);
		const headers = new Headers();
		headers.append("Authorization", `Bearer ${paragonToken}`);
		headers.append("Content-Type", "application/json");

		const erroredRecords = await pullSyncedRecords(session.user.id, trigger[0].id, headers);
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


