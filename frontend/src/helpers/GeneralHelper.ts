
import axios, { AxiosError } from 'axios';


export function getBaseUrl( url: string){
  return "http://localhost:8000/api/";  
}


export function handleError(error: any) {
  if (axios.isAxiosError(error)) {
        // If it's an axios error, get a more specific message
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.message || "Network Error";
        return errorMessage;
  }
  throw error;
}
