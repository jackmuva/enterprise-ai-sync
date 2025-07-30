import { getSyncTriggerByUserIdAndSource } from '@/db/queries';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 } from 'uuid';

interface Chunk {
  _id: string,
  score: number,
  fields: {
    chunk_text: string,
    url: string,
    record_name: string,
    source: string,
    nativeId: string
  }
}

interface PermissionsResponse {
  allowed: true,
  request: {
    object: string,
    relation: string,
    user: string
  },
  error: string
}

class PineconeService {
  protected _pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });

  constructor() { }

  public static createService = async () => {
    const ps = new PineconeService();

    try {
      await ps._pc.describeIndex(process.env.PINECONE_INDEX!);
    } catch (err) {
      const response = await ps._pc.createIndexForModel({
        name: process.env.PINECONE_INDEX!,
        cloud: 'aws',
        region: 'us-east-1',
        embed: {
          model: 'llama-text-embed-v2',
          fieldMap: { text: 'chunk_text' },
        },
        waitUntilReady: true,
      });
      if (response?.status.ready) {
        console.log(`PINCECONE INDEX created`);
      } else {
        throw err;
      }
    }

    return ps;
  };

  public async retrieveContext({ query, namespaceName, token }: { query: string, namespaceName: string, token: string }): Promise<any> {
    const namespace = this._pc.index(process.env.PINECONE_INDEX!).namespace(namespaceName);
    const searchWithText = await namespace.searchRecords({
      query: {
        topK: 5,
        inputs: { text: query },
      },
      fields: ['chunk_text', 'url', 'record_name', 'source', 'nativeId'],
      rerank: {
        model: 'bge-reranker-v2-m3',
        rankFields: ['chunk_text'],
        topN: 3,
      },
    });
    //return searchWithText;
    //@ts-ignore
    const permittedText = await this.enforcePermissions(namespaceName, token, searchWithText.result.hits);
    console.log('permitted: ', permittedText);
    return permittedText;
  }

  private async enforcePermissions(email: string, token: string, chunks: Array<Chunk>) {
    const syncMap = new Map();
    const sourceMap = new Map();
    const chunkMap = new Map();
    for (const chunk of chunks) {
      if (!syncMap.has(chunk.fields.source)) {
        const trigger = await getSyncTriggerByUserIdAndSource({ id: email, source: chunk.fields.source });
        if (trigger.length === 0) {
          continue;
        }
        syncMap.set(chunk.fields.source, trigger[0].syncId);
      }
      chunkMap.set(chunk.fields.nativeId, chunk);
      if (sourceMap.has(chunk.fields.source)) {
        const cur = sourceMap.get(chunk.fields.source);
        cur.push({
          object: chunk.fields.nativeId,
          role: "can_read",
          user: "user:" + email,
        });
      } else {
        sourceMap.set(chunk.fields.source, [{
          object: chunk.fields.nativeId,
          role: "can_read",
          user: "user:" + email,
        }]);
      }
    }

    const permitted = [];
    for (const sync of syncMap.keys()) {
      const checkReq = await fetch(`https://sync.useparagon.com/api/permissions/${syncMap.get(sync)}/batch-check`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          checks: sourceMap.get(sync)
        }),
      });
      if (!checkReq.ok) {
        console.error("Error checking permissions: ", checkReq.statusText);
        continue;
      }
      const checkResponse: { result: Array<PermissionsResponse> } = await checkReq.json();
      for (const check of checkResponse.result) {
        if (check.allowed) {
          permitted.push(chunkMap.get(check.request.object.split(":")[1]));
        }
      }
    }
    return permitted;
  }

  public async upsertText({ text, metadata, namespaceName }: { text: string, metadata: any, namespaceName: string }): Promise<void> {
    const chunkSize = 512;
    const overlap = 20;
    const data = [];

    let end = 0;
    let beg = 0;
    while (end < text.length) {
      end = beg + chunkSize;
      data.push({
        ...metadata,
        id: v4(),
        chunk_text: end >= text.length ? text.slice(beg) : text.slice(beg, end),
      });
      beg = end - overlap;
    }

    const namespace = this._pc.index(process.env.PINECONE_INDEX!).namespace(namespaceName);

    let i = 0;
    while (i <= data.length) {
      namespace.upsertRecords((i + 96) < data.length ? data.slice(i, i + 96) : data.slice(i))
        .then(() => {
          if (i + 96 < data.length) {
            return new Promise(resolve => setTimeout(resolve, 5000));
          }
        });
      i += 96;
    }
  }
}

export const pineconeService = await PineconeService.createService();
