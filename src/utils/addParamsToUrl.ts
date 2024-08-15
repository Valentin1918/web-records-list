export const addParamsToUrl = (baseUrl: string) => (params: Record<string, string | number>): string => {
  const url = new URL(baseUrl);
  const urlParams = new URLSearchParams(url.search);

  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, `${value}`);
  });

  url.search = urlParams.toString();
  return url.toString();
}
