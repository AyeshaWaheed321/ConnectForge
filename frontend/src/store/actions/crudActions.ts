import { CRUD_ACTION } from '../../constants/ActionKeys';
import service from '../../services/Api/Service';

export const handleAction = (type: string, payload?: any) => ({
  type,
  payload,
});

export const getAction = (url: string, data: any, key: string) => {
  return async (dispatch: any) => {
    try {
      dispatch(handleAction(CRUD_ACTION.GET_REQUEST, { key, params: data?.params }));

      const response = await service.getService(url, data);
      
      if (response) {
        dispatch(handleAction(CRUD_ACTION.GET_SUCCESS, { key, response }));
      } else {
        dispatch(handleAction(CRUD_ACTION.GET_FAILURE));
      }
      
      return response;
    } catch (error) {
      dispatch(handleAction(CRUD_ACTION.GET_FAILURE, { key, error }));
      throw error;
    }
  };
};

// Add other actions similar to your example...

export const updateKeyData = (data: any, key: string) => {
  return async (dispatch: any) => {
    dispatch(handleAction(CRUD_ACTION.UPDATE_KEY_DATA, { key, data }));
  };
};

export const resetKeyData = () => {
  return async (dispatch: any) => {
    dispatch(handleAction(CRUD_ACTION.RESET_KEY_DATA));
  };
};