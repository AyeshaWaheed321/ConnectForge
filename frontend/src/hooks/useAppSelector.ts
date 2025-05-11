// hooks/useAppSelector.ts
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import rootReducer from  '../store/reducers/index'; // adjust

type RootState = ReturnType<typeof rootReducer>;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default useAppSelector;
