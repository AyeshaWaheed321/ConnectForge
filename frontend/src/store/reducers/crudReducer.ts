import { CRUD_ACTION } from '../../constants/ActionKeys';
import { REDUX_STATES } from '../../constants/ReduxStates';

const {
  DEFAULT_GET_KEY,
  DEFAULT_POST_KEY,
  DEFAULT_PUT_KEY,
  DEFAULT_PATCH_KEY,
  DEFAULT_DELETE_KEY,
  DEFAULT_SELECTED_KEY,
  LOADING,
  ERROR,
  RESPONSE,
  PARAMS,
} = REDUX_STATES;

const initialState = {};
const EMPTY_ERROR_OBJECT = {};

const crudReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CRUD_ACTION.GET_REQUEST:
      const get_keyR = action?.payload?.key || DEFAULT_GET_KEY;
      return {
        ...state,
        [get_keyR + LOADING]: true,
        [get_keyR + ERROR]: false,
        [get_keyR + RESPONSE]: null,
        [get_keyR + PARAMS]: action?.payload?.params || {},
      };

    case CRUD_ACTION.GET_SUCCESS:
      const get_keyS = action?.payload?.key || DEFAULT_GET_KEY;
      const get_responseS = action?.payload?.response;
      return {
        ...state,
        [get_keyS + LOADING]: false,
        [get_keyS + ERROR]: false,
        [get_keyS + RESPONSE]: get_responseS,
      };

    case CRUD_ACTION.GET_FAILURE:
      const get_keyE = action?.payload?.key || DEFAULT_GET_KEY;
      const get_Error = action?.payload?.error?.response || EMPTY_ERROR_OBJECT;
      return {
        ...state,
        [get_keyE + LOADING]: false,
        [get_keyE + ERROR]: get_Error,
      };

    // Add other cases similar to your example...

    case CRUD_ACTION.UPDATE_KEY_DATA:
      const update_key = action?.payload?.key || DEFAULT_SELECTED_KEY;
      const update_data = action?.payload?.data;
      return {
        ...state,
        [update_key + RESPONSE]: update_data,
        [update_key + PARAMS]: update_data,
        [update_key + 'Success']: true,
      };

    case CRUD_ACTION.RESET_KEY_DATA:
      return initialState;

    default:
      return state;
  }
};

export default crudReducer;