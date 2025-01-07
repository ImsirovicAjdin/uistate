import React, { useEffect, useState } from 'react';
import { PerformanceTracker, Metrics } from './PerformanceTracker';

export function PerformanceDisplay() {
    const [metrics, setMetrics] = useState<Metrics>({
        stateUpdateDuration: 0,
        renderDuration: 0,
        fps: 0,
        memoryUsage: 0,
        longTaskDuration: 0
    });

    useEffect(() => {
        const tracker = PerformanceTracker.getInstance();
        
        const updateMetrics = (newMetrics: Metrics) => {
            setMetrics(newMetrics);
        };

        tracker.addObserver(updateMetrics);
        return () => tracker.removeObserver(updateMetrics);
    }, []);

    return (
        <div className="performance-display">
            <h3>Performance Metrics</h3>
            <ul>
                <li>State Update Duration: {metrics.stateUpdateDuration.toFixed(2)}ms</li>
                <li>Render Duration: {metrics.renderDuration.toFixed(2)}ms</li>
                <li>FPS: {metrics.fps.toFixed(0)}</li>
                <li>Memory Usage: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</li>
                <li>Long Task Duration: {metrics.longTaskDuration.toFixed(2)}ms</li>
            </ul>
        </div>
    );
}
