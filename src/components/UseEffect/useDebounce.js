import React from 'react';

export const useDebounce = (text, delay) => {
  delay = delay || 500;
  const [debounced, setDebounced] = React.useState(text);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(text);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [text, delay]);

  return debounced;
};
