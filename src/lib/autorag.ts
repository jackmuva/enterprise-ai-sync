// NOTE: Consider making an interface for returned data from cf search
interface AutoRagSearchResults {
  success: boolean,
  result: {
    object: string,
    search_query: string,
    data: Array<any>,
    has_more: boolean,
    next_page: string
  },
}

export const retrieveContext = async (query: string, userId: string): Promise<AutoRagSearchResults | null> => {
  const request = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/autorag/rags/${process.env.AUTORAG_NAME}/ai-search`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AUTORAG_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      max_num_results: 5,
      ranking_options: {
        score_threshold: 0.3
      },
      filters: {
        type: "eq",
        key: "folder",
        value: userId + "/",
      },
    }),
  });

  const response: AutoRagSearchResults = await request.json();
  if (response.success) {
    const allowedContext = await enforcePermissionsOnContext(response.result.data, userId);
    console.log(allowedContext);
    return {
      success: response.success,
      result: {
        object: response.result.object,
        search_query: response.result.search_query,
        data: allowedContext,
        has_more: response.result.has_more,
        next_page: response.result.next_page
      },
    }
  }
  return null;
}

const enforcePermissionsOnContext = async (contexts: Array<any>, userId: string): Promise<Array<any>> => {
  //NOTE: may not be the best endpoint to use, depending on how many objects a user may have access to
  //const permRequest = await fetch(process.env.MANAGED_SYNC_URL + "/permissions/list-objects", {
  //  method: "POST",
  //  headers: {
  //    "Authorization": `Bearer ${session.paragonUserToken}`,
  //    "Content-Type": "application/json",
  //  },
  //  body: JSON.stringify({
  //    user: {
  //      id: impersonatedUser 
  //    }
  //  }),
  //});
  //const permResponse = await permRequest.json();
  //const permObjects: Array<any> = permResponse.objects;
  //
  //TODO: Swap this chunk code out when permission api is ready
  const permObjects = [
    { id: "autorag_documentation.md" },
    { id: "rag_core_concepts.md" },
    { id: "developer_marketing_strategy.md" },
    { id: "ai_and_rag_webinar.md" },
    { id: "configuration_guide.md" },
  ];

  const permSet = new Set(permObjects.map((obj) => {
    return obj.id;
  }));
  //FIX: robust implementation of getting object id
  const allowedContext = contexts.filter((context) => permSet.has(context.filename.split("/").at(-1)));
  return allowedContext;
}
