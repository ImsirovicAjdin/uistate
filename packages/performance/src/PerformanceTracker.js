class PerformanceTracker {
    constructor(appName) {
        this.appName = appName;
        this.metrics = {
            stateUpdates: [],
            renders: [],
            memory: [],
            interactions: [],
            fps: [],
            longTasks: []
        };
        this.observers = new Set();
        this.startTime = performance.now();
        this.initObservers();
    }

    initObservers() {
        // Track long tasks
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.longTasks.push({
                    duration: entry.duration,
                    timestamp: performance.now() - this.startTime
                });
                this.notifyObservers();
            }
        });
        observer.observe({ entryTypes: ['longtask'] });

        // Track FPS
        let lastTime = performance.now();
        let frames = 0;
        const measureFPS = () => {
            const now = performance.now();
            frames++;
            
            if (now - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                this.metrics.fps.push({
                    value: fps,
                    timestamp: now - this.startTime
                });
                frames = 0;
                lastTime = now;
                this.notifyObservers();
            }
            
            requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);

        // Track memory
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory.push({
                    used: performance.memory.usedJSHeapSize / 1048576,
                    total: performance.memory.totalJSHeapSize / 1048576,
                    timestamp: performance.now() - this.startTime
                });
                this.notifyObservers();
            }, 1000);
        }
    }

    trackStateUpdate(action, duration) {
        this.metrics.stateUpdates.push({
            action,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    trackRender(component, duration) {
        this.metrics.renders.push({
            component,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    trackInteraction(type, duration) {
        this.metrics.interactions.push({
            type,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.getMetrics()));
    }

    getMetrics() {
        const now = performance.now();
        return {
            appName: this.appName,
            uptime: now - this.startTime,
            currentMetrics: {
                fps: this.metrics.fps[this.metrics.fps.length - 1]?.value || 0,
                memory: this.metrics.memory[this.metrics.memory.length - 1]?.used || 0,
                stateUpdatesCount: this.metrics.stateUpdates.length,
                rendersCount: this.metrics.renders.length,
                longTasksCount: this.metrics.longTasks.length,
                averageStateUpdateTime: this.calculateAverage(this.metrics.stateUpdates, 'duration'),
                averageRenderTime: this.calculateAverage(this.metrics.renders, 'duration'),
                averageInteractionTime: this.calculateAverage(this.metrics.interactions, 'duration')
            },
            detailedMetrics: this.metrics
        };
    }

    calculateAverage(array, key) {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, item) => acc + item[key], 0);
        return sum / array.length;
    }

    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            metrics: this.getMetrics()
        };
    }
}

export default PerformanceTracker;
