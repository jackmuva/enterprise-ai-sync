import { userWithToken } from "@/app/actions/auth";
import { getSyncTriggerByUserIdAndSource } from "@/db/queries";
import { CRM_INTEGRATIONS, FILE_STORAGE_INTEGRATIONS, SyncedObjectType } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const objectType = request.nextUrl.searchParams.get("objectType");
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	try {
		const refresh: any = {};
		const statuses: any = {};
		const sources: Array<string> | undefined = objectType === SyncedObjectType.FILE_STORAGE ? FILE_STORAGE_INTEGRATIONS : CRM_INTEGRATIONS;
		for (const source of sources!) {
			refresh[source] = false;
			const trigger = await getSyncTriggerByUserIdAndSource({ id: session.user.email, source: source });
			if (trigger.length === 0) {
				throw new Error("unable to get trigger");
			}
			const statusReq = await fetch(`https://sync.useparagon.com/api/syncs/${trigger[0].syncId}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${session.paragonUserToken}`,
					"Content-Type": "application/json",
				},
			});
			const status = await statusReq.json();
			statuses[source] = status;
			if (["IDLE", "ERRORED"].includes(status.status)) {
				refresh[source] = true;
			}
		}

		return Response.json({ refresh: refresh, statuses: statuses });
	} catch (err) {
		console.error("unable to get sync statuses", err);
		return Response.json({ status: 500, message: "unable to check sync status" });
	}
}
