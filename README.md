# UIstate

A revolutionary approach to UI state management using CSS custom properties and DOM attributes, featuring Attribute-Driven State Inheritance (ADSI).

**Current Version**: 3.1.1

**Author**: Ajdin Imsirovic <ajdika@live.com> (GitHub)  
**Maintainer**: uistate <ajdika.i@gmail.com> (npm)

## Packages

- [@uistate/core](./packages/core) - Core state management functionality using CSS variables and data attributes
- [@uistate/observer](./packages/observer) - Observer plugins for DOM-based state changes (coming soon)
- [@uistate/hsm](./packages/hsm) - Hierarchical State Machine implementation (coming soon)
- [@uistate/performance](./packages/performance) - Performance monitoring and visualization tools (coming soon)

## Key Features

- 🚀 Potentially O(1) state updates
- 📉 Significant memory savings compared to virtual DOM approaches
- 🎯 DOM as the single source of truth
- 🔄 CSS-driven state derivation
- 🎨 Framework agnostic
- 📦 Tiny bundle size
- ⚡ Hierarchical state inheritance

## Examples

Explore our [documentation and examples](./docs/index.html) to see UIstate in action:

- Range sliders with different state derivation approaches
- Button toggles with CSS state projection
- Font adjusters with domain-based state management
- And more!

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Philosophy

UIstate challenges traditional assumptions in web development by using the DOM as the source of truth for state, leveraging CSS variables and data attributes for state storage, and using the CSS cascade for state inheritance and derivation.

## License

MIT © Ajdin Imsirovic
