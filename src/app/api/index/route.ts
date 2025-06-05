import { pineconeService } from "@/lib/pinecone";

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

	pineconeService.upsertText({ text: "placeholder", namespaceName: body.user.id, metadata: {} });
}
