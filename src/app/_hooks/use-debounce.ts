import { useEffect } from 'react';

const useDebounce = (
  callback: () => void,
  delay: number,
  changingValues: any[],
) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, ...changingValues]);
};

export default useDebounce;
