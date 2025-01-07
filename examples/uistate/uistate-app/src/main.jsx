import React from 'react';
import ReactDOM from 'react-dom/client';
import UIState from './core/UIState';
import App from './App';
import './index.css';
import PerformanceTracker from '../../shared/PerformanceTracker';
import PerformanceDisplay from '../../shared/PerformanceDisplay';

// Initialize performance tracker
const tracker = new PerformanceTracker('UIState App');

// Initialize UIState with performance tracking
const originalSetState = UIState.setState.bind(UIState);
UIState.setState = function trackedSetState(key, value) {
    const start = performance.now();
    originalSetState(key, value);
    const duration = performance.now() - start;
    tracker.trackStateUpdate(key, duration);
};

// Initialize UIState
UIState.init();

// Set initial state
UIState.setState('theme', 'light');
UIState.setState('layout-sidebar', true);
UIState.setState('active-tab', 'dashboard');
UIState.setState('notifications', []);

const AppWithPerformance = () => (
    <>
        <App />
        <PerformanceDisplay tracker={tracker} />
    </>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppWithPerformance />
    </React.StrictMode>
);
