export const isJsonObj = (params: string) => {
    
  try {
    if (JSON.parse(params)) return true;
    return false;
  } catch (_) {
    return false;
  }
};
