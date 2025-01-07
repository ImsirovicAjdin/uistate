import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import './index.css';
import App from './App';
import PerformanceTracker from '../../shared/PerformanceTracker';
import PerformanceDisplay from '../../shared/PerformanceDisplay';

// Initialize performance tracker
const tracker = new PerformanceTracker('Traditional App');

// Wrap Redux dispatch to track state updates
const originalDispatch = store.dispatch;
store.dispatch = function trackedDispatch(action) {
    const start = performance.now();
    const result = originalDispatch(action);
    const duration = performance.now() - start;
    tracker.trackStateUpdate(action.type, duration);
    return result;
};

const AppWithPerformance = () => (
    <Provider store={store}>
        <App />
        <PerformanceDisplay tracker={tracker} />
    </Provider>
);

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppWithPerformance />
    </React.StrictMode>
);
