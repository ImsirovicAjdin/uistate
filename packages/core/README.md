# @uistate/core v3.1.2

**author**: Ajdin Imsirovic <ajdika@live.com> (GitHub)  
**maintainer**: uistate <ajdika.i@gmail.com> (npm)

High-performance UI state management using CSS custom properties and ADSI (Attribute-Driven State Inheritance). Focused heavily on DX and performance with a fully declarative approach.

## What's New in v3.1.1

- 🛠️ Added `setStates()` method for batch state updates
- 🧩 Added `registerSpecialHandler()` and `registerEventBinding()` for extensibility
- 🏷️ New `setupObservers()` for automatic state-to-DOM binding
- ⚡ Improved `setupStateActions()` with customizable event handling
- 💾 Default event handlers for clicks and inputs with declarative binding
- 🗡️ Enhanced attribute serialization with specialized handlers

## What's New in v3.0.0

- 🔄 Fully declarative state management approach
- 🧩 Enhanced template system with CSS-based templates
- 🚀 Improved performance through optimized state propagation
- 📦 New state serialization and inspection capabilities
- 🔍 Telemetry plugin for better debugging

## Features

- 🚀 O(1) state updates using CSS custom properties
- 📉 Significant memory savings compared to virtual DOM approaches
- 🎯 Zero configuration
- 🔄 Automatic reactivity through CSS cascade
- 🎨 Framework agnostic
- 📦 Tiny bundle size (~2KB)
- 🧩 Modular architecture with dedicated modules for CSS state and templates
- 📝 Declarative HTML-in-CSS templates

## Installation

```bash
npm install @uistate/core
```

## Why @uistate/core?

### Performance

- **CSS-Driven Updates**: Leverages browser's CSS engine for optimal performance with O(1) complexity
- **DOM as Source of Truth**: Efficient state storage using CSS custom properties and data attributes
- **Minimal Overhead**: No virtual DOM diffing or shadow DOM needed

### Developer Experience

- **Declarative API**: Define UI structure in CSS templates
- **Framework Agnostic**: Works with any framework or vanilla JavaScript
- **Zero Config**: No store setup, no reducers, no actions
- **CSS-Native**: Leverages the power of CSS selectors and the cascade

### Core Concepts

- **Attribute-Driven State Inheritance (ADSI)**: State represented both as CSS variables and data attributes
- **Declarative Templates**: Define UI components directly in CSS
- **Automatic State Propagation**: State changes automatically update the UI

## Project Structure

```
@uistate/core/
├── src/                    # Core library
│   ├── index.js           # Main entry 
│   ├── cssState.js        # CSS variables management
│   ├── templateManager.js # Declarative template management
│   ├── stateInspector.js  # State inspection tools
│   └── stateSerializer.js # State serialization
└── examples/              # Example applications
    └── 001-.../ # Progressive examples from simpler to more complex
```

## Browser Support

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 79+

# Core Ideas Behind UIstate

UIstate is a JavaScript-based UI state management system that leverages CSS custom properties and HTML-in-CSS templates for a fully declarative approach to building UIs.

## Key Components

### UIstate Core

The main UIstate object provides methods to manage state and templates:

- **init()**: Initialize the UIstate system
- **setState()**: Set state values
- **getState()**: Get state values
- **subscribe()**: Subscribe to state changes
- **observe()**: Observe state paths for changes

### Template Manager

The template manager provides tools for declarative UI rendering:

- **renderTemplateFromCss()**: Render UI components from CSS-defined templates
- **registerActions()**: Register event handlers for UI components
- **attachDelegation()**: Set up event delegation for efficient event handling

## Key Features

1. Uses CSS custom properties as a storage mechanism, making state changes automatically trigger UI updates
2. Provides a clear separation between state storage (CSS) and behavior (JavaScript)
3. Implements a pub/sub pattern for reactive updates
4. Leverages CSS templates for declarative UI definition

This implementation is particularly useful for building UI components with clean separation of concerns, optimal performance, and a fully declarative approach.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Ajdin Imsirovic
