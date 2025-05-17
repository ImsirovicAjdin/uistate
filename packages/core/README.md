# @uistate/core

**author**: Ajdin Imsirovic <ajdika@live.com> (GitHub)  
**maintainer**: uistate <ajdika.i@gmail.com> (npm)

High-performance UI state management using CSS custom properties and ADSI (Attribute-Driven State Inheritance). Focused heavily on DX and performance.

## Features

- 🚀 Potentially O(1) state updates using CSS custom properties
- 📉 Significant memory savings compared to virtual DOM approaches
- 🎯 Zero configuration
- 🔄 Automatic reactivity through CSS cascade
- 🎨 Framework agnostic
- 📦 Tiny bundle size (~2KB)
- 🧩 Modular architecture with dedicated modules for CSS state and events

## Installation

```bash
# Install the core package
npm install @uistate/core
```

## Quick Start

```javascript
import { cssState, eventState } from '@uistate/core';

// Initialize state
cssState.init();

// Set state via CSS variables
cssState.set('--counter-value', '0');

// Get state
const count = parseInt(cssState.get('--counter-value'));

// Subscribe to changes
const unsubscribe = eventState.on('counter:change', (newValue) => {
  console.log('Counter changed:', newValue);
});

// Set state with an attribute
document.documentElement.dataset.counterValue = count + 1;
```

### HTML Usage Example

```html
<button data-counter-value="0" id="counter-btn">Count: 0</button>
```

```css
[data-counter-value] {
  /* Style based on state */
}
```

```javascript
document.getElementById('counter-btn').addEventListener('click', () => {
  const btn = document.getElementById('counter-btn');
  const currentValue = parseInt(btn.dataset.counterValue);
  btn.dataset.counterValue = currentValue + 1;
  btn.textContent = `Count: ${currentValue + 1}`;
  eventState.emit('counter:change', currentValue + 1);
});
```

## Why @uistate/core?

### Performance

- **CSS-Driven Updates**: Leverages browser's CSS engine for optimal performance with O(1) complexity
- **DOM as Source of Truth**: Efficient state storage using CSS custom properties and data attributes
- **Minimal Overhead**: No virtual DOM diffing or shadow DOM needed

### Developer Experience

- **Simple API**: Modular `cssState` and `eventState` for clear separation of concerns
- **Framework Agnostic**: Works with any framework or vanilla JavaScript
- **Zero Config**: No store setup, no reducers, no actions
- **CSS-Native**: Leverages the power of CSS selectors and the cascade

### Core Concepts

- **Attribute-Driven State Inheritance (ADSI)**: State represented both as CSS variables and data attributes
- **Hierarchical State Machines**: Model complex UI states with nested state machines
- **CSS-Driven State Derivation**: Derive complex states using CSS without JavaScript

## Project Structure

```
@uistate/core/
├── src/                  # Core library
│   ├── index.js         # Main entry 
│   ├── cssState.js      # CSS variables management
│   ├── eventState.js    # Event-based state transitions
│   └── templateManager.js # Component management
└── examples/            # Example applications
    ├── basic/          # Simple examples (range sliders, toggles, etc)
    └── advanced/       # Advanced patterns and techniques
```

## Browser Support

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 79+

# Core Ideas Behind UIstate

UIstate is a JavaScript-based UI state management system that leverages CSS custom properties and data attributes as the storage mechanism, paired with event-based state transitions.

## Key Components

### cssState

The `cssState` module provides methods to manage state through CSS custom properties:

```javascript
// Initialize CSS state management
cssState.init();

// Set a CSS custom property
cssState.set('--theme-mode', 'dark');

// Get a CSS custom property value
const theme = cssState.get('--theme-mode');
```

### eventState

The `eventState` module provides an event system for state transitions:

```javascript
// Listen for state changes
eventState.on('theme:change', (newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Trigger state changes
eventState.emit('theme:change', 'light');

// Clean up listeners
eventState.off('theme:change');
```

### templateManager

The `templateManager` module helps with component initialization and templating:

```javascript
// Initialize components from templates
templateManager.init();

// Create a component from a template
const button = templateManager.createFromTemplate('button-template');
document.body.appendChild(button);
```

## Key Features

1. Uses CSS custom properties as a storage mechanism, making state changes automatically trigger UI updates
2. Provides a clear separation between state storage (CSS) and behavior (JavaScript)
3. Implements a pub/sub pattern for reactive updates
4. Leverages the CSS cascade for hierarchical state inheritance

This implementation is particularly useful for building UI components with clean separation of concerns and optimal performance.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Ajdin Imsirovic
