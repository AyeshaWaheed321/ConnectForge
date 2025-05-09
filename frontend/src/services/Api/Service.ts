// service.ts
import  { apiClient } from './ApiClient'; // adjust path if needed

const client = apiClient();

const service = {
  getService: async (url: string, data: any) => {
    console.log("getService", url, data);
    return await client.get(url, { params: data?.params });
  },

  postService: async (url: string, data: any, options?: any) => {
    return await client.post(url, data, options);
  },

  putService: async (url: string, data: any, options?: any) => {
    return await client.put(url, data, options);
  },

  patchService: async (url: string, data: any, options?: any) => {
    return await client.patch(url, data, options);
  },

  deleteService: async (url: string, data: any, options?: any) => {
    return await client.delete(url, data, options);
  },
};

export default service;
