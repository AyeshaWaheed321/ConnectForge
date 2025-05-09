
// axios
import axios from "axios";
// Helper
import { getBaseUrl } from "../../helpers/GeneralHelper";

export const apiClient = () => {
  // const token = StorageService?.instance?.getAccessToken();

  // Dummy Condition, will remove with actual api
  let defaultOptions =  {
        headers: {
          "Content-Type": "application/json",
        },
      };

  // Request timeout
  defaultOptions = {
    ...defaultOptions,
  //  timeout: API_TIMEOUT,
  };

  return {
    get: (url: string, options = {}) =>
      axios.get(`${getBaseUrl(url)}${url}`, { 
        ...defaultOptions, 
        ...options,
        headers: defaultOptions.headers
      }),
    post: (url: string, data: any, options = {}) =>
      axios.post(`${getBaseUrl(url)}${url}`, data, {
        ...defaultOptions,
        ...options,
      }),
    put: (url: string, data: any, options = {}) =>
      axios.put(`${getBaseUrl(url)}${url}`, data, {
        ...defaultOptions,
        ...options,
      }),
    patch: (url: string, data: any, options = {}) =>
      axios.patch(`${getBaseUrl(url)}${url}`, data, {
        ...defaultOptions,
        ...options,
      }),
    delete: (url: string, data: any, options = {}) =>
      axios.delete(`${getBaseUrl(url)}${url}`, {
        ...defaultOptions,
        ...options,
        data,
      }),
  };
};
