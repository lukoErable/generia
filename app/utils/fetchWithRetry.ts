export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
};
