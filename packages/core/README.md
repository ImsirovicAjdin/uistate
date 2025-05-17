# @uistate/core

**author**: Ajdin Imsirovic <ajdika@live.com> (GitHub),
**maintainer**: uistate <ajdika.i@gmail.com> (npm)

High-performance UI state management using CSS custom properties and a number of other novel ideas. Focused heavily on DX and performance, in that order.

## Features

- ~~🚀 44% faster state updates than Redux~~ Potentially O(1) state updates!
- ~~📉 12.5% lower memory usage~~ Large memory usage savings (perf pending...)
- 🎯 Zero configuration
- 🔄 Automatic reactivity
- 🎨 Framework agnostic
- 📦 Tiny bundle size (~1KB)
- ~~💪 Full TypeScript support~~ Sorry, JS-only for a while...
- ~~📊 Optional performance monitoring~~ In progress (perf pending...)

## Installation

```bash
# Install the core package
npm install @uistate/core

# Optional: Install performance monitoring
npm install @uistate/performance
```

## Quick Start

```typescript
import { UIState } from '@uistate/core';

// Initialize state
UIState.init();

// Set state
UIState.setState('count', 0);

// Get state
const count = UIState.getState('count');

// Subscribe to changes
const unsubscribe = UIState.observe('count', (newValue) => {
  console.log('Count changed:', newValue);
});

// React Hook
import { useUIState } from '@uistate/core/react';

function Counter() {
  const [count, setCount] = useUIState('count', 0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Why @uistate/core?

### Performance

- **44% Faster Updates**: Leverages browser's CSS engine for optimal performance
- **12.5% Lower Memory**: Efficient state storage using CSS custom properties
- **Minimal Overhead**: No virtual DOM diffing for state updates

### Developer Experience

- **Simple API**: Just `setState`, `getState`, and `observe`
- **TypeScript Support**: Full type safety and autocompletion
- **Framework Agnostic**: Works with any framework
- **Zero Config**: No store setup, no reducers, no actions

## Performance Monitoring

The `@uistate/performance` package provides detailed performance metrics for your application:

```typescript
import { PerformanceTracker } from '@uistate/performance';
import { PerformanceDisplay } from '@uistate/performance';

// Start tracking performance
const tracker = PerformanceTracker.getInstance();
tracker.start();

// Optional: Add the performance display component to your React app
function App() {
  return (
    <div>
      <YourApp />
      <PerformanceDisplay />
    </div>
  );
}
```

The performance tracker monitors:
- State update duration
- Component render time
- FPS (Frames Per Second)
- Memory usage
- Long task duration

## Project Structure

```
@uistate/core/
├── src/                  # Core library
│   ├── index.ts         # Main entry
│   ├── UIState.ts       # Core implementation
│   └── react/           # React bindings
│       └── index.ts     # React hooks
├── packages/
│   └── performance/     # Performance monitoring package
└── examples/            # Example applications
    ├── traditional/     # Traditional Redux app
    └── uistate/        # UIState implementation
```

## Browser Support

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 79+

# Explanation of the Core Ideas Behind the UI State Management System

A TypeScript-based UI state management system that leverages CSS custom properties (CSS variables) as the storage mechanism.

## Key Components

### Type Definitions

```typescript
type StateObserver<T> = (value: T) => void;
interface UIStateType { ... }
```

- Defines a type for state change observers (callbacks)
- Defines the interface for the state management system

## Core Functionality

The `UIState` object provides several key methods:

### `init()`
- Creates a style element in the document head
- Initializes a CSS stylesheet for managing custom properties
- Returns the UIState instance for chaining

### `setState<T>(key: string, value: T)`
- Stores values as CSS custom properties (--key)
- Converts non-string values to JSON strings
- Notifies observers when values change

### `getState<T>(key: string)`
- Retrieves values from CSS custom properties
- Attempts to parse JSON values back to their original type
- Falls back to raw string if parsing fails

### `observe<T>(key: string, callback)`
- Implements an observer pattern for state changes
- Returns a cleanup function to remove the observer
- Allows multiple observers per state key

## Internal Mechanisms

```typescript
_sheet: CSSStyleSheet | null        // Stores the stylesheet reference
_observers: Map<string, Set<StateObserver>>  // Stores observers per key
```

## Key Features

1. Uses CSS custom properties as a storage mechanism, making state changes automatically trigger UI updates
2. Provides type safety through TypeScript generics
3. Implements the observer pattern for reactive updates
4. Handles serialization/deserialization of complex data types through JSON

## Example Usage

```typescript
UIState.init();
UIState.setState('theme', 'dark');
UIState.observe('theme', (newValue) => {
    console.log('Theme changed to:', newValue);
});
const currentTheme = UIState.getState<string>('theme');
```

This implementation is particularly useful for managing global UI state like themes, layout preferences, or any other state that might affect multiple components simultaneously.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Ajdin Imsirovic
