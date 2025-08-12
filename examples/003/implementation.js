import UIstate from '../../cssState.js';

UIstate.registerSpecialHandler('thisStateActionIsHandlerInRSH', {
    action: target => {
        // Most idiomatic implementation
        // 1. Get source element using stateSource attribute
        // 2. Get target state name from stateTarget attribute
        // 3. Update state
        if (target.dataset.stateSource && target.dataset.stateTarget) {
            const input = document.querySelector(target.dataset.stateSource);
            UIstate.setState(target.dataset.stateTarget, input?.value || '');
        }
    }
});

UIstate.init({ mode: 'hybrid' });
UIstate.setupObservers();
UIstate.setupStateActions();
