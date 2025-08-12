# UIstate

A revolutionary approach to UI state management using CSS custom properties and DOM attributes, featuring Attribute-Driven State Inheritance (ADSI).

**Current Version**: 4.0.2

**Author**: Ajdin Imsirovic <ajdika@live.com> (GitHub)  
**Maintainer**: uistate <ajdika.i@gmail.com> (npm)

## Installation

```bash
npm install @uistate/core
```

## Quick Start

UIstate v4.0.0 provides four core modules that can be imported individually:

```javascript
import { createCssState, createEventState, stateSerializer, createTemplateManager } from '@uistate/core';

// Create CSS-based state management
const cssState = createCssState();

// Create event-based state management  
const eventState = createEventState();

// Use state serialization utilities
const serialized = stateSerializer.serialize(myState);

// Create template manager for declarative UI
const templateManager = createTemplateManager();
```

## Core Modules

### `createCssState`
Manages state using CSS custom properties for optimal performance and automatic reactivity.

### `createEventState` 
Provides event-driven state management with pub/sub patterns.

### `stateSerializer`
Utilities for serializing and deserializing state data.

### `createTemplateManager`
Declarative template management system for building UIs with CSS-based templates.

## Key Features

- Potentially O(1) state updates
- Significant memory savings compared to virtual DOM approaches
- DOM as the single source of truth
- CSS-driven state derivation
- Framework agnostic
- Tiny bundle size (~30KB uncompressed, ~8-10KB gzipped)
- Zero dependencies
- Modular architecture - import only what you need

## Browser Support

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 79+

## Philosophy

UIstate challenges traditional assumptions in web development by using the DOM as the source of truth for state, leveraging CSS variables and data attributes for state storage, and using the CSS cascade for state inheritance and derivation.

The v4.0.0 release focuses on simplicity and modularity - providing clean, individual modules that can be composed together as needed, without the complexity of a unified framework.

## Examples

Explore our documentation and examples to see UIstate in action:

- Range sliders with different state derivation approaches
- Button toggles with CSS state projection
- Font adjusters with domain-based state management
- And more!

## License

MIT  Ajdin Imsirovic
