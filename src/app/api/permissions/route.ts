import { userWithToken } from "@/app/actions/auth";
import { NextRequest } from "next/server";
import { getSyncTriggerByUserIdAndSource } from "@/db/queries";

export async function POST(req: NextRequest) {
	const session = await userWithToken();
	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}
	const body: { integration: string, id: string } = await req.json();
	const trigger = await getSyncTriggerByUserIdAndSource({ id: session.user.email, source: body.integration });
	console.log('trigger: ', trigger);
	if (trigger.length === 0) {
		return Response.json("No Sync Enabled", { status: 500 });
	}
	//const token = await createParagonToken(session.user.email);
	const token = session.paragonUserToken;
	console.log('token: ', token);
	const checkReq = await fetch(`https://sync.useparagon.com/api/permissions/${trigger[0].syncId}/list-users`, {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': "application/json",
		},
		body: JSON.stringify({
			role: "can_read",
			object: body.id,
		}),
	});
	const checkRes = await checkReq.json();
	console.log(checkRes);
	return Response.json(checkRes);
}
