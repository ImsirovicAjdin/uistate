import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';

const PerformanceMonitor = () => {
    const [stats, setStats] = useState({
        fps: 0,
        memory: 0,
        renders: 0,
        lastUpdate: performance.now()
    });

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let renderCount = 0;

        const updateStats = () => {
            const now = performance.now();
            const delta = now - lastTime;
            
            if (delta >= 1000) {
                // Calculate FPS
                const fps = Math.round((frameCount * 1000) / delta);
                
                // Get memory usage if available
                const memory = performance.memory 
                    ? Math.round(performance.memory.usedJSHeapSize / 1048576)
                    : 0;

                setStats({
                    fps,
                    memory,
                    renders: renderCount,
                    lastUpdate: now
                });

                frameCount = 0;
                lastTime = now;
                renderCount = 0;
            }

            frameCount++;
            renderCount++;
            requestAnimationFrame(updateStats);
        };

        requestAnimationFrame(updateStats);
    }, []);

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                p: 2,
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
            }}
        >
            <Typography variant="h6">Performance Stats</Typography>
            <Box>
                <Typography>FPS: {stats.fps}</Typography>
                <Typography>Memory: {stats.memory}MB</Typography>
                <Typography>Renders: {stats.renders}/s</Typography>
            </Box>
        </Paper>
    );
};

export default PerformanceMonitor;
