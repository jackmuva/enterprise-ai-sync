export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const info = await res.json();
    const status = res.status;
    const error = new Error(
      `An error occurred while fetching the data: ${status}.\n ${info}`,
    );
    throw error;
  }
  return res.json();
};


export function formatJson(data: object | string): string {
  try {
    if (typeof data === "string") {
      return JSON.stringify(JSON.parse(data), null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};
