import { useState, useEffect } from 'react';
import UIState from './UIState';

export function useUIState(key, initialValue) {
    const [value, setValue] = useState(() => {
        // Initialize state if provided
        if (initialValue !== undefined && UIState.getState(key) === undefined) {
            UIState.setState(key, initialValue);
        }
        return UIState.getState(key) ?? initialValue;
    });

    useEffect(() => {
        // Subscribe to changes
        const unsubscribe = UIState.observe(key, setValue);
        return unsubscribe;
    }, [key]);

    const updateValue = (newValue) => {
        UIState.setState(key, newValue);
    };

    return [value, updateValue];
}

export default useUIState;
