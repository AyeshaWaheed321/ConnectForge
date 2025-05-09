
export function getBaseUrl( url: string){
  // Dummy condition, will remove with actual api
  if (url.includes("api")) {
    return "https://api.example.com/";
  }
  return "https://example.com/";
}
