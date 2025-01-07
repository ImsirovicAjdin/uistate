interface Metric {
    timestamp: number;
}

interface StateUpdateMetric extends Metric {
    action: string;
    duration: number;
}

interface RenderMetric extends Metric {
    component: string;
    duration: number;
}

interface MemoryMetric extends Metric {
    used: number;
    total: number;
}

interface FPSMetric extends Metric {
    value: number;
}

interface LongTaskMetric extends Metric {
    duration: number;
}

interface InteractionMetric extends Metric {
    type: string;
    duration: number;
}

interface Metrics {
    stateUpdates: StateUpdateMetric[];
    renders: RenderMetric[];
    memory: MemoryMetric[];
    interactions: InteractionMetric[];
    fps: FPSMetric[];
    longTasks: LongTaskMetric[];
}

type MetricsObserver = (metrics: Metrics) => void;

declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}

class PerformanceTracker {
    private appName: string;
    private metrics: Metrics;
    private observers: Set<MetricsObserver>;
    private startTime: number;

    constructor(appName: string) {
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

    private initObservers(): void {
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

    public trackStateUpdate(action: string, duration: number): void {
        this.metrics.stateUpdates.push({
            action,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    public trackRender(component: string, duration: number): void {
        this.metrics.renders.push({
            component,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    public trackInteraction(type: string, duration: number): void {
        this.metrics.interactions.push({
            type,
            duration,
            timestamp: performance.now() - this.startTime
        });
        this.notifyObservers();
    }

    public subscribe(callback: MetricsObserver): () => void {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    private notifyObservers(): void {
        this.observers.forEach(callback => callback(this.getMetrics()));
    }

    public getMetrics(): Metrics {
        return {
            stateUpdates: [...this.metrics.stateUpdates],
            renders: [...this.metrics.renders],
            memory: [...this.metrics.memory],
            interactions: [...this.metrics.interactions],
            fps: [...this.metrics.fps],
            longTasks: [...this.metrics.longTasks]
        };
    }

    public getAverages(): Record<string, number> {
        return {
            stateUpdateDuration: this.average(this.metrics.stateUpdates, 'duration'),
            renderDuration: this.average(this.metrics.renders, 'duration'),
            fps: this.average(this.metrics.fps, 'value'),
            memoryUsage: this.average(this.metrics.memory, 'used'),
            longTaskDuration: this.average(this.metrics.longTasks, 'duration')
        };
    }

    private average<T extends { [key: string]: any }>(
        array: T[],
        key: keyof T
    ): number {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, item) => acc + Number(item[key]), 0);
        return sum / array.length;
    }
}

export default PerformanceTracker;
