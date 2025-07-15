import { userWithToken } from "@/app/actions/auth";
import { createActivity } from "@/db/queries";

interface TriggerPayload {
	integration: string,
	pipeline: string,
	configuration?: any,
	configurationName?: string,
}

export async function POST(req: Request) {
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	try {
		//NOTE:Need to figure out what user id is returned by sync
		//const user = getUser(session.user.email);
		const trigger: TriggerPayload = await req.json();
		const syncRequest = await fetch("https://sync.useparagon.com/api/syncs", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${session.paragonUserToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				integration: trigger.integration,
				pipeline: trigger.pipeline,
				configuration: trigger.configuration ?? {},
				configurationName: trigger.configurationName ?? "",
			}),
		});
		if (syncRequest.ok) {
			throw new Error("Sync request failed: " + syncRequest.status);
		}
		const syncResponse = await syncRequest.json();
		console.log(syncResponse);
		const activity = await createActivity({
			event: "sync_triggered",
			syncId: syncResponse.id,
			source: trigger.integration,
			objectType: "File Storage",
			receivedAt: new Date(),
			data: JSON.stringify(syncResponse),
			userId: session.user.email,
		});
		return Response.json({ activity: activity });
	} catch (err) {
		console.error("unable to sync for user: ", session.user.email, err);
		return Response.json("Unable to sync", { status: 500 });
	}
}
