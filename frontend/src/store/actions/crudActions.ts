import { CRUD_ACTION } from '../../constants/ActionKeys';
import service from '../../services/Api/Service';

export const handleAction = (type: string, payload?: any) => ({
  type,
  payload,
});

export const getAction = (url: string, data: any, key: string) => {
  return async (dispatch: any) => {
    try {
      console.log('getAction', url, data);
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

export const postAction = (url: string, data: any, opt: any, key: string) => {
  return async (dispatch: any) => {
    try {
      dispatch(handleAction(CRUD_ACTION.POST_REQUEST, { key }));

      const response = await service.postService(url, data, opt);

      if (response) {
        dispatch(handleAction(CRUD_ACTION.POST_SUCCESS, { key, response }));
      } else {
        dispatch(handleAction(CRUD_ACTION.POST_FAILURE, { key }));
      }

      return response;
    } catch (error) {
      dispatch(handleAction(CRUD_ACTION.POST_FAILURE, { key, error }));
      throw error;
    }
  };
};

export const deleteAction = (url: string, data: any, opt: any, key: string) => {
  return async (dispatch: any) => {
    try {
      dispatch(handleAction(CRUD_ACTION.DELETE_REQUEST, { key }));

      const response = await service.deleteService(url, data, opt);

      if (response) {
        dispatch(handleAction(CRUD_ACTION.DELETE_SUCCESS, { key, response }));
      } else {
        dispatch(handleAction(CRUD_ACTION.DELETE_FAILURE, { key }));
      }

      return response;
    } catch (error) {
      dispatch(handleAction(CRUD_ACTION.DELETE_FAILURE, { key, error }));
      throw error;
    }
  };
};
