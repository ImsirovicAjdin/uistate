/*
(1) - Register theme handler
(2) - Initialize UIstate system and set up initial state, configure the
      serializer with hybrid mode (auto-selects best strategy based on value type)
(3) - Set initial state values
(4) - Set up DOM-based state observations and actions
*/

import UIstate from '../../cssState.js';

// (1) Register special handlers
UIstate.registerSpecialHandler('theme', {
    action: (target) => {
        // Direct value setting (e.g., light, dark)
        if (target.dataset.stateValue !== undefined) {
            UIstate.setState('theme', target.dataset.stateValue);
            return;
        }

        // Selector-based value source (from input or select)
        if (target.dataset.stateSource) {
            try {
                // Use querySelector to find the referenced element
                const sourceElement = document.querySelector(target.dataset.stateSource);

                if (sourceElement && sourceElement.value !== undefined) {
                    // Handle color picker special case
                    if (sourceElement.type === 'color') {
                        // Set theme-color state first, then set theme to custom
                        UIstate.setState('theme-color', sourceElement.value);
                        UIstate.setState('theme', 'custom');
                    } else {
                        // Normal case - use the value directly
                        UIstate.setState('theme', sourceElement.value);
                    }
                }
            } catch (e) {
                console.error('Invalid selector:', target.dataset.stateSource, e);
            }
        }
    }
});

// Register observer for theme changes
UIstate.registerSpecialHandler('theme-observer', {
    observe: (element, value) => {
        // Simply return the theme value (or default to 'light')
        // UIstate will automatically handle updating CSS variables and data-attributes
        return value || 'light';
    }
});

// (2) Initialize UIstate system
UIstate.init({
    mode: 'hybrid',     // Options: 'escape', 'json', or 'hybrid'
    debug: true        // Set to true for serialization debugging in console
});

// (3) Set initial values
UIstate.setState('theme', 'light');

// (4) Set up DOM-based state observations and actions
UIstate.setupObservers();
UIstate.setupStateActions();
