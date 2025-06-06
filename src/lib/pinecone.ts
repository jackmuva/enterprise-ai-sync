import { Pinecone } from '@pinecone-database/pinecone';
import { v4 } from 'uuid';

class PineconeService {
  protected _pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });

  constructor() { }

  public static createService = async () => {
    const ps = new PineconeService();

    try {
      const desc = await ps._pc.describeIndex(process.env.PINECONE_INDEX!);
      console.log(desc);
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

  public async retrieveContext({ query, namespaceName }: { query: string, namespaceName: string }): Promise<any> {
    const namespace = this._pc.index(process.env.PINECONE_INDEX!).namespace(namespaceName);
    const searchWithText = await namespace.searchRecords({
      query: {
        topK: 5,
        inputs: { text: query },
      },
      fields: ['chunk_text', 'url', 'record_name', 'source'],
      rerank: {
        model: 'bge-reranker-v2-m3',
        rankFields: ['chunk_text'],
        topN: 3,
      },
    });
    console.log(searchWithText.result.hits);

    return searchWithText;
  }

  public async upsertText({ text, metadata, namespaceName }: { text: string, metadata: any, namespaceName: string }): Promise<any> {
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
    const numUpserted = await namespace.upsertRecords(data);
    return numUpserted;
  }
}

export const pineconeService = await PineconeService.createService();
