import { userWithToken } from "@/app/actions/auth";
import { getActivityByUserIdAndObjectType } from "@/db/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const objectType = request.nextUrl.searchParams.get("objectType");
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const syncedObjects = await getActivityByUserIdAndObjectType({ id: session.user.email, objectType: objectType! });
	return Response.json(syncedObjects);
}
