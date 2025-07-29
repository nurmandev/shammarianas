import { useEffect, useCallback } from "react";

const useKey = (key, action, options = {}) => {
  const {
    eventType = 'keydown',
    preventDefault = false,
    stopPropagation = false,
    ignoreInputs = true
  } = options;

  const handleKey = useCallback((e) => {
    // Skip if focused on input/textarea and ignoreInputs is true
    if (ignoreInputs && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }
    
    // Normalize key comparison
    const normalizedKey = key.toUpperCase();
    const pressedKey = e.key.toUpperCase();
    const pressedCode = e.code.toUpperCase();
    
    // Check both key and code to support different keyboard layouts
    if (pressedKey === normalizedKey || pressedCode === normalizedKey) {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      action(e);
    }
  }, [key, action, preventDefault, stopPropagation, ignoreInputs]);

  useEffect(() => {
    document.addEventListener(eventType, handleKey);
    return () => document.removeEventListener(eventType, handleKey);
  }, [eventType, handleKey]);
};

export default useKey;