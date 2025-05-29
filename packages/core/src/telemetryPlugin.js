/**
 * UIstate Telemetry Plugin
 * 
 * A plugin for tracking and analyzing usage patterns in UIstate applications.
 * Provides insights into method calls, state changes, and performance metrics.
 * 
 * Features:
 * - Automatic tracking of API method calls
 * - State change monitoring
 * - Performance timing
 * - Usage statistics and reporting
 * - Visual dashboard integration
 */

/**
 * Create a telemetry plugin instance
 * @param {Object} config - Configuration options
 * @returns {Object} - Configured telemetry plugin
 */
const createTelemetryPlugin = (config = {}) => {
    // Default configuration
    const defaultConfig = {
        enabled: true,
        trackStateChanges: true,
        trackMethodCalls: true,
        trackPerformance: true,
        maxEntries: 1000,
        logToConsole: false,
        samplingRate: 1.0, // 1.0 = track everything, 0.5 = track 50% of events
    };

    // Merge provided config with defaults
    const options = { ...defaultConfig, ...config };
    
    // Telemetry data storage
    const data = {
        startTime: Date.now(),
        methodCalls: new Map(),
        stateChanges: new Map(),
        performanceMetrics: new Map(),
        unusedMethods: new Set(),
        activeTimers: new Map()
    };
    
    // Reference to the UIstate instance
    let uistateRef = null;
    
    // Original method references
    const originalMethods = new Map();
    
    // Methods to track (will be populated during initialization)
    const methodsToTrack = [
        'getState', 'setState', 'subscribe', 'observe',
        'configureSerializer', 'getSerializerConfig', 'setSerializationMode',
        'onAction', 'registerActions', 'attachDelegation', 'mount',
        'renderTemplateFromCss', 'createComponent', 'applyClassesFromState'
    ];
    
    // Helper function to check if we should sample this event
    const shouldSample = () => {
        return options.samplingRate >= 1.0 || Math.random() <= options.samplingRate;
    };
    
    // Helper function to track a method call
    const trackMethodCall = (methodName, args = [], result = undefined, error = null, duration = 0) => {
        if (!options.enabled || !options.trackMethodCalls || !shouldSample()) return;
        
        if (!data.methodCalls.has(methodName)) {
            data.methodCalls.set(methodName, []);
        }
        
        const calls = data.methodCalls.get(methodName);
        
        // Limit the number of entries to prevent memory issues
        if (calls.length >= options.maxEntries) {
            calls.shift(); // Remove oldest entry
        }
        
        // Create a safe copy of arguments (avoiding circular references)
        const safeArgs = Array.from(args).map(arg => {
            try {
                // For simple types, return as is
                if (arg === null || arg === undefined || 
                    typeof arg === 'string' || 
                    typeof arg === 'number' || 
                    typeof arg === 'boolean') {
                    return arg;
                }
                
                // For functions, just return the function name or "[Function]"
                if (typeof arg === 'function') {
                    return arg.name || "[Function]";
                }
                
                // For objects, create a simplified representation
                if (typeof arg === 'object') {
                    if (Array.isArray(arg)) {
                        return `[Array(${arg.length})]`;
                    }
                    return Object.keys(arg).length > 0 
                        ? `[Object: ${Object.keys(arg).join(', ')}]`
                        : '[Object]';
                }
                
                return String(arg);
            } catch (e) {
                return "[Complex Value]";
            }
        });
        
        // Create a safe copy of the result
        let safeResult;
        try {
            if (result === null || result === undefined || 
                typeof result === 'string' || 
                typeof result === 'number' || 
                typeof result === 'boolean') {
                safeResult = result;
            } else if (typeof result === 'function') {
                safeResult = result.name || "[Function]";
            } else if (typeof result === 'object') {
                if (Array.isArray(result)) {
                    safeResult = `[Array(${result.length})]`;
                } else {
                    safeResult = Object.keys(result).length > 0 
                        ? `[Object: ${Object.keys(result).join(', ')}]`
                        : '[Object]';
                }
            } else {
                safeResult = String(result);
            }
        } catch (e) {
            safeResult = "[Complex Value]";
        }
        
        // Record the call
        calls.push({
            timestamp: Date.now(),
            relativeTime: Date.now() - data.startTime,
            args: safeArgs,
            result: safeResult,
            error: error ? error.message : null,
            duration
        });
        
        // Log to console if enabled
        if (options.logToConsole) {
            console.log(`[Telemetry] ${methodName}`, {
                args: safeArgs,
                result: safeResult,
                error: error ? error.message : null,
                duration
            });
        }
    };
    
    // Helper function to track state changes
    const trackStateChange = (path, value, previousValue) => {
        if (!options.enabled || !options.trackStateChanges || !shouldSample()) return;
        
        if (!data.stateChanges.has(path)) {
            data.stateChanges.set(path, []);
        }
        
        const changes = data.stateChanges.get(path);
        
        // Limit the number of entries to prevent memory issues
        if (changes.length >= options.maxEntries) {
            changes.shift(); // Remove oldest entry
        }
        
        // Create safe copies of values
        let safeValue, safePreviousValue;
        try {
            safeValue = JSON.stringify(value);
        } catch (e) {
            safeValue = String(value);
        }
        
        try {
            safePreviousValue = JSON.stringify(previousValue);
        } catch (e) {
            safePreviousValue = String(previousValue);
        }
        
        // Record the change
        changes.push({
            timestamp: Date.now(),
            relativeTime: Date.now() - data.startTime,
            value: safeValue,
            previousValue: safePreviousValue
        });
    };
    
    // Helper function to start a performance timer
    const startTimer = (label) => {
        if (!options.enabled || !options.trackPerformance) return;
        
        data.activeTimers.set(label, performance.now());
    };
    
    // Helper function to end a performance timer
    const endTimer = (label) => {
        if (!options.enabled || !options.trackPerformance) return 0;
        
        if (!data.activeTimers.has(label)) return 0;
        
        const startTime = data.activeTimers.get(label);
        const duration = performance.now() - startTime;
        
        data.activeTimers.delete(label);
        
        if (!data.performanceMetrics.has(label)) {
            data.performanceMetrics.set(label, {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                samples: []
            });
        }
        
        const metrics = data.performanceMetrics.get(label);
        metrics.count++;
        metrics.totalDuration += duration;
        metrics.minDuration = Math.min(metrics.minDuration, duration);
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        
        // Store sample data (limited to prevent memory issues)
        if (metrics.samples.length >= options.maxEntries) {
            metrics.samples.shift();
        }
        
        metrics.samples.push({
            timestamp: Date.now(),
            relativeTime: Date.now() - data.startTime,
            duration
        });
        
        return duration;
    };
    
    // Method proxying function
    const createMethodProxy = (obj, methodName) => {
        // Store original method
        const originalMethod = obj[methodName];
        originalMethods.set(methodName, originalMethod);
        
        // Create proxy
        return function(...args) {
            if (!options.enabled) {
                return originalMethod.apply(this, args);
            }
            
            let result, error;
            
            startTimer(`method.${methodName}`);
            
            try {
                // Call original method
                result = originalMethod.apply(this, args);
                
                // Handle promises
                if (result instanceof Promise) {
                    return result
                        .then(asyncResult => {
                            const duration = endTimer(`method.${methodName}`);
                            trackMethodCall(methodName, args, asyncResult, null, duration);
                            return asyncResult;
                        })
                        .catch(asyncError => {
                            const duration = endTimer(`method.${methodName}`);
                            trackMethodCall(methodName, args, undefined, asyncError, duration);
                            throw asyncError;
                        });
                }
                
                const duration = endTimer(`method.${methodName}`);
                trackMethodCall(methodName, args, result, null, duration);
                return result;
                
            } catch (e) {
                error = e;
                const duration = endTimer(`method.${methodName}`);
                trackMethodCall(methodName, args, undefined, error, duration);
                throw error;
            }
        };
    };
    
    // Create the telemetry plugin
    const telemetryPlugin = {
        name: 'telemetry',
        
        // Initialize the plugin
        init(api) {
            if (!options.enabled) return this;
            
            uistateRef = api;
            
            // Proxy methods for tracking
            if (options.trackMethodCalls) {
                methodsToTrack.forEach(methodName => {
                    if (typeof api[methodName] === 'function') {
                        // Add to list of methods to check for usage
                        data.unusedMethods.add(methodName);
                        
                        // Create proxy
                        api[methodName] = createMethodProxy(api, methodName);
                    }
                });
            }
            
            return this;
        },
        
        // Middleware for state changes
        middlewares: [
            (path, value, getState) => {
                if (options.enabled && options.trackStateChanges) {
                    const previousValue = getState(path);
                    startTimer(`stateChange.${path}`);
                    
                    // Return a proxy that will track after the state change
                    return {
                        __telemetryValue: true,
                        value,
                        path,
                        previousValue,
                        finalize() {
                            const duration = endTimer(`stateChange.${path}`);
                            trackStateChange(path, value, previousValue);
                            return value;
                        }
                    };
                }
                return value;
            }
        ],
        
        // Lifecycle hooks
        hooks: {
            beforeStateChange: (path, value) => {
                // If this is our proxy value, do nothing
                if (value && value.__telemetryValue) {
                    return;
                }
            },
            
            afterStateChange: (path, value) => {
                // If this is our proxy value, finalize it
                if (value && value.__telemetryValue) {
                    return value.finalize();
                }
            }
        },
        
        // Plugin methods
        methods: {
            // Enable or disable telemetry
            setEnabled(enabled) {
                options.enabled = enabled;
                return this;
            },
            
            // Get current configuration
            getConfig() {
                return { ...options };
            },
            
            // Update configuration
            configure(newConfig) {
                Object.assign(options, newConfig);
                return this;
            },
            
            // Reset telemetry data
            reset() {
                data.startTime = Date.now();
                data.methodCalls.clear();
                data.stateChanges.clear();
                data.performanceMetrics.clear();
                data.activeTimers.clear();
                return this;
            },
            
            // Get method call statistics
            getMethodStats() {
                const stats = {};
                
                data.methodCalls.forEach((calls, methodName) => {
                    // Mark method as used
                    data.unusedMethods.delete(methodName);
                    
                    stats[methodName] = {
                        count: calls.length,
                        averageDuration: calls.reduce((sum, call) => sum + (call.duration || 0), 0) / calls.length,
                        lastCall: calls[calls.length - 1],
                        firstCall: calls[0]
                    };
                });
                
                return stats;
            },
            
            // Get detailed method call data
            getMethodCalls(methodName) {
                if (!methodName) {
                    const result = {};
                    data.methodCalls.forEach((calls, method) => {
                        result[method] = [...calls];
                    });
                    return result;
                }
                
                return data.methodCalls.has(methodName) 
                    ? [...data.methodCalls.get(methodName)]
                    : [];
            },
            
            // Get state change statistics
            getStateStats() {
                const stats = {};
                
                data.stateChanges.forEach((changes, path) => {
                    stats[path] = {
                        count: changes.length,
                        lastChange: changes[changes.length - 1],
                        firstChange: changes[0]
                    };
                });
                
                return stats;
            },
            
            // Get detailed state change data
            getStateChanges(path) {
                if (!path) {
                    const result = {};
                    data.stateChanges.forEach((changes, statePath) => {
                        result[statePath] = [...changes];
                    });
                    return result;
                }
                
                return data.stateChanges.has(path) 
                    ? [...data.stateChanges.get(path)]
                    : [];
            },
            
            // Get performance metrics
            getPerformanceMetrics() {
                const metrics = {};
                
                data.performanceMetrics.forEach((data, label) => {
                    metrics[label] = {
                        count: data.count,
                        totalDuration: data.totalDuration,
                        averageDuration: data.totalDuration / data.count,
                        minDuration: data.minDuration,
                        maxDuration: data.maxDuration
                    };
                });
                
                return metrics;
            },
            
            // Get unused methods
            getUnusedMethods() {
                return [...data.unusedMethods];
            },
            
            // Get comprehensive telemetry report
            getReport() {
                return {
                    startTime: data.startTime,
                    duration: Date.now() - data.startTime,
                    methodStats: this.getMethodStats(),
                    stateStats: this.getStateStats(),
                    performanceMetrics: this.getPerformanceMetrics(),
                    unusedMethods: this.getUnusedMethods(),
                    config: this.getConfig(),
                    // Add detailed logs for download
                    detailedLogs: {
                        methodCalls: this.getMethodCalls(),
                        stateChanges: this.getStateChanges()
                    }
                };
            },
            
            // Download telemetry logs as a JSON file
            downloadLogs() {
                const report = this.getReport();
                const data = JSON.stringify(report, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `uistate-telemetry-${new Date().toISOString().replace(/:/g, '-')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                return true;
            },
            
            // Create a visual dashboard
            createDashboard(container = document.body) {
                // Create dashboard element
                const dashboard = document.createElement('div');
                dashboard.className = 'uistate-telemetry-dashboard';
                dashboard.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    width: 300px;
                    max-height: 400px;
                    overflow: auto;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 10px;
                    font-family: monospace;
                    font-size: 12px;
                    z-index: 9999;
                `;
                
                // Update function
                const updateDashboard = () => {
                    const report = this.getReport();
                    
                    dashboard.innerHTML = `
                        <h3 style="margin: 0 0 10px; font-size: 14px;">UIstate Telemetry</h3>
                        <div style="margin-bottom: 5px;">
                            <button id="telemetry-refresh">Refresh</button>
                            <button id="telemetry-reset">Reset</button>
                            <button id="telemetry-close">Close</button>
                        </div>
                        <div style="margin: 10px 0;">
                            <strong>Duration:</strong> ${Math.round((Date.now() - report.startTime) / 1000)}s
                        </div>
                        
                        <h4 style="margin: 10px 0 5px; font-size: 13px;">Method Calls</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="text-align: left; border-bottom: 1px solid #eee;">Method</th>
                                <th style="text-align: right; border-bottom: 1px solid #eee;">Count</th>
                                <th style="text-align: right; border-bottom: 1px solid #eee;">Avg Time</th>
                            </tr>
                            ${Object.entries(report.methodStats)
                                .sort((a, b) => b[1].count - a[1].count)
                                .map(([method, stats]) => `
                                    <tr>
                                        <td style="padding: 2px 0; border-bottom: 1px solid #eee;">${method}</td>
                                        <td style="text-align: right; padding: 2px 0; border-bottom: 1px solid #eee;">${stats.count}</td>
                                        <td style="text-align: right; padding: 2px 0; border-bottom: 1px solid #eee;">${stats.averageDuration ? stats.averageDuration.toFixed(2) + 'ms' : 'n/a'}</td>
                                    </tr>
                                `).join('')}
                        </table>
                        
                        <h4 style="margin: 10px 0 5px; font-size: 13px;">State Changes</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="text-align: left; border-bottom: 1px solid #eee;">Path</th>
                                <th style="text-align: right; border-bottom: 1px solid #eee;">Count</th>
                            </tr>
                            ${Object.entries(report.stateStats)
                                .sort((a, b) => b[1].count - a[1].count)
                                .map(([path, stats]) => `
                                    <tr>
                                        <td style="padding: 2px 0; border-bottom: 1px solid #eee;">${path}</td>
                                        <td style="text-align: right; padding: 2px 0; border-bottom: 1px solid #eee;">${stats.count}</td>
                                    </tr>
                                `).join('')}
                        </table>
                        
                        ${report.unusedMethods.length > 0 ? `
                            <h4 style="margin: 10px 0 5px; font-size: 13px;">Unused Methods</h4>
                            <div style="color: #666;">
                                ${report.unusedMethods.join(', ')}
                            </div>
                        ` : ''}
                    `;
                    
                    // Add event listeners
                    dashboard.querySelector('#telemetry-refresh').addEventListener('click', updateDashboard);
                    dashboard.querySelector('#telemetry-reset').addEventListener('click', () => {
                        this.reset();
                        updateDashboard();
                    });
                    dashboard.querySelector('#telemetry-close').addEventListener('click', () => {
                        dashboard.remove();
                    });
                };
                
                // Initial update
                updateDashboard();
                
                // Add to container
                container.appendChild(dashboard);
                
                return dashboard;
            }
        },
        
        // Clean up
        destroy() {
            // Restore original methods
            if (uistateRef) {
                originalMethods.forEach((originalMethod, methodName) => {
                    if (uistateRef[methodName]) {
                        uistateRef[methodName] = originalMethod;
                    }
                });
            }
            
            // Clear data
            data.methodCalls.clear();
            data.stateChanges.clear();
            data.performanceMetrics.clear();
            data.activeTimers.clear();
            data.unusedMethods.clear();
            
            uistateRef = null;
        }
    };
    
    return telemetryPlugin;
};

// Create a default instance with standard configuration
const telemetryPlugin = createTelemetryPlugin();

export default telemetryPlugin;
export { createTelemetryPlugin };
