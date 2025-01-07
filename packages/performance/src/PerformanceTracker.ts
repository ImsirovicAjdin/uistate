export interface Metrics {
    stateUpdateDuration: number;
    renderDuration: number;
    fps: number;
    memoryUsage: number;
    longTaskDuration: number;
}

export class PerformanceTracker {
    private static instance: PerformanceTracker;
    private observers: ((metrics: Metrics) => void)[] = [];
    private metrics: Metrics = {
        stateUpdateDuration: 0,
        renderDuration: 0,
        fps: 0,
        memoryUsage: 0,
        longTaskDuration: 0
    };

    private constructor() {
        // Private constructor to enforce singleton
    }

    public static getInstance(): PerformanceTracker {
        if (!PerformanceTracker.instance) {
            PerformanceTracker.instance = new PerformanceTracker();
        }
        return PerformanceTracker.instance;
    }

    public addObserver(callback: (metrics: Metrics) => void): void {
        this.observers.push(callback);
    }

    public removeObserver(callback: (metrics: Metrics) => void): void {
        this.observers = this.observers.filter(cb => cb !== callback);
    }

    private notifyObservers(): void {
        this.observers.forEach(observer => observer(this.metrics));
    }

    public start(): void {
        // Track FPS
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                this.notifyObservers();
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);

        // Track long tasks
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.longTaskDuration = entry.duration;
                this.notifyObservers();
            }
        });

        observer.observe({ entryTypes: ['longtask'] });

        // Track memory
        if ((performance as any).memory) {
            setInterval(() => {
                const memory = (performance as any).memory;
                if (memory) {
                    this.metrics.memoryUsage = memory.usedJSHeapSize;
                }
                this.notifyObservers();
            }, 1000);
        }
    }

    public trackStateUpdate(duration: number): void {
        this.metrics.stateUpdateDuration = duration;
        this.notifyObservers();
    }

    public trackRender(duration: number): void {
        this.metrics.renderDuration = duration;
        this.notifyObservers();
    }
}
