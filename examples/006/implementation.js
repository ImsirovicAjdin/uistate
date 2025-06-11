import UIstate from '../../packages/core/src/cssState.js';

// Register theme handler
UIstate.registerSpecialHandler('theme', {
    action: (target) => {
        // Get theme value from the button
        const themeValue = target.dataset.stateValue;

        UIstate.setStates({
            'theme': themeValue,
        });
    }
});

// Initialize UIstate system and set up initial state
// Configure the serializer with hybrid mode (auto-selects best strategy based on value type)
UIstate.init({
    mode: 'hybrid',     // Options: 'escape', 'json', or 'hybrid'
    debug: true        // Set to true for serialization debugging in console
});

// Set initial state values
UIstate.setStates({
    'theme': 'light',  // Using light theme as default
});

// Set up DOM-based state observations and actions
UIstate.setupObservers();
UIstate.setupStateActions();
