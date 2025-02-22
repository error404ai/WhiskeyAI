const mergeData = <T extends Record<string, unknown>>(...data: T[]) => {
  const result: T = {} as T;
  for (const obj of data) {
    for (const key in obj) {
      if (!result.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
  }

  return result;
};

const parseUrlParams = (request: Request) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  return Object.fromEntries(params) as Record<string, unknown>;
};

const parseBody = async (request: Request): Promise<Record<string, unknown>> => {
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as unknown as Record<string, unknown>;
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const urlParams = new URLSearchParams(await request.text());
    return Object.fromEntries(urlParams) as Record<string, unknown>;
  }
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const data: Record<string, unknown> = {};
    for (const entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }
    return data;
  }
  return {};
};

export const parseRequest = async (request: Request) => {
  const urlParams = parseUrlParams(request);
  const bodyParams = await parseBody(request);
  const data = mergeData(urlParams, bodyParams);

  return data;
};
