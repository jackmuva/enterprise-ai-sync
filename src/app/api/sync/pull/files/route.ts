import { createActivity, getSyncTriggerByUserIdAndSource } from "@/db/queries";
import { Activity } from "@/db/schema";
import { createParagonToken } from "@/app/actions/auth";
import { pullSyncedRecords } from "@/lib/sync";
import { userWithToken } from "@/app/actions/auth";

interface FilePull {
	event: string,
	sync: string,
	objectType: string,
	data?: any,
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

		await createActivity({
			event: body.event,
			syncId: trigger[0].syncId,
			source: body.sync,
			objectType: body.objectType,
			receivedAt: new Date(),
			data: JSON.stringify(body.data),
			userId: session.user.email,
		});
		const headers = new Headers();
		headers.append("Authorization", `Bearer ${session.paragonUserToken}`);
		headers.append("Content-Type", "application/json");

		const erroredRecords = await pullSyncedRecords(session.user.email, trigger[0], headers);
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


