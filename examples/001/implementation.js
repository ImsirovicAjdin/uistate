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
    action: (target) => { // Simplified parameter signature
        const increment = parseInt(target.dataset.stateIncrement);
        const currentCount = parseInt(UIstate.getState('count')) || 0;
        UIstate.setState('count', currentCount + increment);
    }
});

// (2)
UIstate.init({
    mode: 'hybrid',     // Options: 'escape', 'json', or 'hybrid'
    debug: true        // Set to true for serialization debugging in console
});

// (3)
UIstate.setState('count', 0);

// (4)
UIstate.setupObservers();
UIstate.setupStateActions();
