import { createActivity } from "@/db/queries";
import { pineconeService } from "@/lib/pinecone";

interface TextWebhook {
	event: string,
	sync: string,
	user: {
		id: string
	},
	data: {
		model: string,
		synced_at: string,
		num_records: number
	},
	text: string,
	url: string,
	filename: string,
}

export async function POST(req: Request) {
	const body: TextWebhook = await req.json();

	try {
		await createActivity({
			event: body.event,
			source: body.sync,
			objectType: body.data.model,
			receivedAt: new Date(body.data.synced_at),
			data: JSON.stringify(body.data),
			userId: body.user.id,
		});

		const numUpserted = pineconeService.upsertText({
			text: body.text,
			metadata: {
				url: body.url,
				record_name: body.filename,
				source: body.sync,
			},
			namespaceName: body.user.id,
		});

		return Response.json({
			status: 200,
			message: numUpserted
		});
	} catch (err) {
		return Response.json({
			status: 500,
			message: err
		});
	}
}


