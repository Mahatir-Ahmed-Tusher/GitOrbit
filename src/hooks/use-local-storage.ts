"use client"

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // This effect runs once on the client to read from localStorage
    // and set the initial state.
    setIsMounted(true)
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(error)
      // If parsing fails, we stick with the initialValue provided to the hook.
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // We only want to set the value if the component is mounted on the client.
      if (!isMounted) {
        return
      }
      
      try {
        // Determine the value to store, based on the current state.
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Attempt to save to localStorage first. This is the operation that can throw a quota error.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // If the save is successful, update the component's state.
        setStoredValue(valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
        // Re-throw the error so the calling component can catch it and handle it,
        // for example, by showing a toast notification.
        throw error;
      }
    },
    [isMounted, key, storedValue]
  )
    
  // On the server, or before the client has mounted, return the initial value.
  // The setter function is a no-op to prevent errors.
  if (!isMounted) {
      return [initialValue, () => {}];
  }

  return [storedValue, setValue]
}
