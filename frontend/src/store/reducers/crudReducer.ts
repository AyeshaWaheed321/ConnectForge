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

        //Request
    case CRUD_ACTION.POST_REQUEST:
      const post_keyR = action?.payload?.key || DEFAULT_POST_KEY;

      return {
        ...state,
        [post_keyR + LOADING]: true,
        [post_keyR + ERROR]: false,
      };

    // Success
    case CRUD_ACTION.POST_SUCCESS:
      const post_keyS = action?.payload?.key || DEFAULT_POST_KEY;
      const post_responseS = action?.payload?.response;

      return {
        ...state,
        [post_keyS + LOADING]: false,
        [post_keyS + ERROR]: false,
        [post_keyS + RESPONSE]: post_responseS,
      };

    // Failure
    case CRUD_ACTION.POST_FAILURE:
      const post_keyE = action?.payload?.key || DEFAULT_POST_KEY;
      const post_error = action?.payload?.error?.response || EMPTY_ERROR_OBJECT;

      return {
        ...state,
        [post_keyE + LOADING]: false,
        [post_keyE + ERROR]: post_error,
      };

          /* DELETE */
    //Request
    case CRUD_ACTION.DELETE_REQUEST:
      const delete_keyR = action?.payload?.key || DEFAULT_DELETE_KEY;

      return {
        ...state,
        [delete_keyR + LOADING]: true,
        [delete_keyR + ERROR]: false,
      };

    // Success
    case CRUD_ACTION.DELETE_SUCCESS:
      const delete_keyS = action?.payload?.key || DEFAULT_DELETE_KEY;
      const delete_responseS = action?.payload?.response;

      return {
        ...state,
        [delete_keyS + LOADING]: false,
        [delete_keyS + ERROR]: false,
        [delete_keyS + RESPONSE]: delete_responseS,
      };

          // Failure
    case CRUD_ACTION.DELETE_FAILURE:
      const delete_keyE = action?.payload?.key || DEFAULT_DELETE_KEY;
      const delete_error =
        action?.payload?.error?.response || EMPTY_ERROR_OBJECT;

      return {
        ...state,
        [delete_keyE + LOADING]: false,
        [delete_keyE + ERROR]: delete_error,
      };
    default:
      return state;
  }
};

export default crudReducer;