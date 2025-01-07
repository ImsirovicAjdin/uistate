import React, { useEffect, useState } from 'react';
import PerformanceTracker from './PerformanceTracker';

interface Props {
    tracker: PerformanceTracker;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface Metrics {
    stateUpdateDuration: number;
    renderDuration: number;
    fps: number;
    memoryUsage: number;
    longTaskDuration: number;
}

const PerformanceDisplay: React.FC<Props> = ({ 
    tracker, 
    position = 'top-right' 
}) => {
    const [metrics, setMetrics] = useState<Metrics>({
        stateUpdateDuration: 0,
        renderDuration: 0,
        fps: 0,
        memoryUsage: 0,
        longTaskDuration: 0
    });

    useEffect(() => {
        return tracker.subscribe(() => {
            setMetrics(tracker.getAverages());
        });
    }, [tracker]);

    const positionStyles: Record<string, React.CSSProperties> = {
        'top-left': { top: 16, left: 16 },
        'top-right': { top: 16, right: 16 },
        'bottom-left': { bottom: 16, left: 16 },
        'bottom-right': { bottom: 16, right: 16 }
    };

    return (
        <div
            style={{
                position: 'fixed',
                ...positionStyles[position],
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                zIndex: 9999,
                minWidth: '240px'
            }}
        >
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                Performance Metrics
            </div>
            <div>
                State Updates: {metrics.stateUpdateDuration.toFixed(3)}ms
            </div>
            <div>
                Renders: {metrics.renderDuration.toFixed(3)}ms
            </div>
            <div>
                FPS: {Math.round(metrics.fps)}
            </div>
            <div>
                Memory: {Math.round(metrics.memoryUsage)}MB
            </div>
            <div>
                Long Tasks: {metrics.longTaskDuration.toFixed(3)}ms
            </div>
        </div>
    );
};

export default PerformanceDisplay;
