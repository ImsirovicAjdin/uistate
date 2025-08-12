import UIstate from '../../cssState.js';

// Enhanced declarative input handler with transformations and event support
UIstate.registerSpecialHandler('stateInput', {
    action: target => {
        // For direct input elements (self-source)
        let value;
        let stateTarget = target.dataset.stateTarget;

        if (!stateTarget) return;

        // Get value - either from the target itself or from specified source
        if (target.dataset.stateSource) {
            // Get value from another element
            const sourceElement = document.querySelector(target.dataset.stateSource);
            value = sourceElement?.value || '';
        } else {
            // Get value from self (for inputs with direct state-action)
            value = target.value || '';
        }

        // Apply transformations if specified
        if (target.dataset.stateTransform) {
            switch(target.dataset.stateTransform) {
                case 'uppercase':
                    value = value.toUpperCase();
                    break;
                case 'lowercase':
                    value = value.toLowerCase();
                    break;
                case 'capitalize':
                    value = value.charAt(0).toUpperCase() + value.slice(1);
                    break;
                case 'trim':
                    value = value.trim();
                    break;
                // Add more transformations as needed
            }
        }

        // Update the state
        UIstate.setState(stateTarget, value);
    }
});

UIstate.init({ mode: 'hybrid' });

// Set up initial values
UIstate.setState('actualValueOfInput', '');
UIstate.setState('liveValue', '');
UIstate.setState('transformedValue', '');

// Set up observers
UIstate.setupObservers();

// Set up click actions
UIstate.setupStateActions();

// Set up input event listeners for elements with data-state-event="input"
function setupInputEvents() {
    document.querySelectorAll('[data-state-action][data-state-event="input"]').forEach(el => {
        el.addEventListener('input', e => {
            // Trigger the same handler as for click actions
            const handlerName = el.dataset.stateAction;
            if (UIstate._specialHandlers[handlerName]?.action) {
                UIstate._specialHandlers[handlerName].action(el);
            }
        });
    });
}

// Initialize input events
setupInputEvents();
