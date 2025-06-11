import UIstate from '../../packages/core/src/cssState.js';

// Register theme handler - moved from core library to implementation
UIstate.registerSpecialHandler('theme', {
    observe: value => {
        // Make sure we set the raw theme value, not the serialized version
        const themeValue = value ? UIstate._serializer.deserialize('theme', value) : 'light';
        document.documentElement.dataset.theme = themeValue;
    },
    action: (target) => {
        // Get theme value from the button
        const themeValue = target.dataset.stateValue;

        // Make sure to parse themeChanges as a number to avoid string concatenation
        const currentChanges = parseFloat(UIstate.getState('themeChanges')) || 0;

        UIstate.setStates({
            'theme': themeValue,
            'themeChanges': currentChanges + 1
        });
    }
});

// Register count handler
UIstate.registerSpecialHandler('count', {
    action: (target) => {
        const increment = parseInt(target.dataset.stateIncrement) || 0;
        const currentCount = parseInt(UIstate.getState('count')) || 0;
        UIstate.setState('count', currentCount + increment);
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
    'count': 0,
    'themeChanges': 0,
    'theme': 'light',  // Using light theme as default
});

// Set up DOM-based state observations and actions
UIstate.setupObservers();
UIstate.setupStateActions();
