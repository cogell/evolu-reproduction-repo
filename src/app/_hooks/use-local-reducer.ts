import useLocalState from './use-local-state';

// extend to use immer?
const useLocalReducer = <T extends Record<string, unknown>, A extends unknown>(
  key: string,
  reducer: (state: T, action: A) => T,
  initialStateFn: ((storedState: T | undefined) => T) | T,
): [T, (action: A) => void] => {
  const [state, setState] = useLocalState(key, initialStateFn);

  const dispatch = (action: A) => {
    const nextState = reducer(state, action);
    setState(nextState);
  };

  return [state, dispatch];
};

export default useLocalReducer;
