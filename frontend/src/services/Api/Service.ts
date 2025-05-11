// service.ts
import { apiClient } from './ApiClient'; // adjust path if needed
import { handleError } from '../../helpers/GeneralHelper'; // make sure this is correctly implemented

const client = apiClient();

const service = {
  getService: async (url: string, data: any) => {
    try {
      const response = await client.get(url, { params: data?.params });
      return response;
    } catch (error) {
      throw handleError(error);
    }
  },

  postService: async (url: string, data: any, options?: any) => {
    try {
      const response = await client.post(url, data, options);
      return response;
    } catch (error) {
      throw handleError(error);
    }
  },

  putService: async (url: string, data: any, options?: any) => {
    try {
      const response = await client.put(url, data, options);
      return response;
    } catch (error) {
      throw handleError(error);
    }
  },

  patchService: async (url: string, data: any, options?: any) => {
    try {
      const response = await client.patch(url, data, options);
      return response;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteService: async (url: string, data: any, options?: any) => {
    try {
      const response = await client.delete(url, data, options);
      return response;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default service;
