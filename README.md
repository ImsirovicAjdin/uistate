# @uistate/core

High-performance UI state management using CSS custom properties. 44% faster than traditional state management solutions with 12.5% lower memory usage.

## Features

- 🚀 44% faster state updates than Redux
- 📉 12.5% lower memory usage
- 🎯 Zero configuration
- 🔄 Automatic reactivity
- 🎨 Framework agnostic
- 📦 Tiny bundle size (~1KB)
- 💪 Full TypeScript support
- 📊 Optional performance monitoring

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

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Ajdin Imsirovic
