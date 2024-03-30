import { useEffect, useState, useRef } from "react";

export function useDebounce(value: any, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef<any>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}
