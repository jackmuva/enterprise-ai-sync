import { createUser, getUser } from "@/db/queries";
import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
	async onSuccess(data) {
		const user = await getUser(data.user.email);
		if (!user || user.length === 0) {
			createUser(
				data.user.email,
			);
		}
	},
});
