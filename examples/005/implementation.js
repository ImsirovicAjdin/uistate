/*
(1) - Register count handler
(2) - Initialize UIstate system and set up initial state, configure the
      serializer with hybrid mode (auto-selects best strategy based on value type)
(3) - Set initial state values
(4) - Set up DOM-based state observations and actions
*/

import UIstate from '../../cssState.js';

// (1)
UIstate.registerSpecialHandler('count', {
    action: (target) => {

        // Get the current count (default to 0 if null, undefined, or NaN)
        const currentCount = parseInt(UIstate.getState('count')) || 0;
        let increment = 0;

        // Check for state-value data attribute
        if (target.dataset.stateValue !== undefined) {
            increment = parseInt(target.dataset.stateValue) || 0;
        }
        // Check for selector-based input via data-state-source
        else if (target.dataset.stateSource) {
            try {
                // Use querySelector to find the referenced input element
                const input = document.querySelector(target.dataset.stateSource);
                if (input && input.value !== '') {
                    increment = parseInt(input.value) || 0;
                }
            } catch (e) {
                console.error('Invalid selector:', target.dataset.stateSource, e);
            }
        }

        // Update the count with the increment
        UIstate.setState('count', currentCount + increment);
    }
});

// (2)
UIstate.init({
    mode: 'hybrid',     // Options: 'escape', 'json', or 'hybrid'
    debug: true        // Set to true for serialization debugging in console
});

// (3)
UIstate.setState('count', 0); // Explicitly set initial count to 0

// (4)
UIstate.setupObservers();
UIstate.setupStateActions();
