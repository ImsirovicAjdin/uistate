/**
 * StateInspector - Real-time state inspection panel for UIstate
 *
 * This module provides a configurable UI panel that displays and allows manipulation
 * of CSS variables and state values in UIstate applications.
 *
 * Features:
 * - Toggle visibility with a dedicated button
 * - Real-time updates of CSS variable values
 * - Organized display of state by categories
 * - Ability to filter state variables
 * - Direct manipulation of state values
 */

/**
 * Create a configured state inspector instance
 * @param {Object} config - Configuration options
 * @returns {Object} - StateInspector instance
 */
function createStateInspector(config = {}) {
    // Default configuration
    const defaultConfig = {
        target: document.body,
        initiallyVisible: false,
        categories: ['app', 'ui', 'data'],
        position: 'bottom-right',
        maxHeight: '300px',
        stateManager: null, // Optional reference to UIstate or CssState instance
        theme: 'light'
    };

    // Merge provided config with defaults
    const options = { ...defaultConfig, ...config };

    // Private state
    let isVisible = options.initiallyVisible;
    let panel = null;
    let toggleButton = null;
    let filterInput = null;
    let stateContainer = null;
    let currentFilter = '';

    // StateInspector instance
    const inspector = {
        // Current configuration
        config: options,

        /**
         * Update configuration
         * @param {Object} newConfig - New configuration options
         */
        configure(newConfig) {
            Object.assign(this.config, newConfig);
            this.refresh();
        },

        /**
         * Attach the inspector panel to the target element
         * @param {Element} element - Target element to attach to (defaults to config.target)
         * @returns {Object} - The inspector instance for chaining
         */
        attach(element = this.config.target) {
            // Implementation will create and attach the panel
            // For now, this is a placeholder
            console.log('StateInspector: Panel would be attached to', element);
            return this;
        },

        /**
         * Show the inspector panel
         * @returns {Object} - The inspector instance for chaining
         */
        show() {
            isVisible = true;
            if (panel) panel.style.display = 'block';
            return this;
        },

        /**
         * Hide the inspector panel
         * @returns {Object} - The inspector instance for chaining
         */
        hide() {
            isVisible = false;
            if (panel) panel.style.display = 'none';
            return this;
        },

        /**
         * Toggle the visibility of the inspector panel
         * @returns {Object} - The inspector instance for chaining
         */
        toggle() {
            return isVisible ? this.hide() : this.show();
        },

        /**
         * Refresh the state display
         * @returns {Object} - The inspector instance for chaining
         */
        refresh() {
            // Implementation will update the displayed state values
            // For now, this is a placeholder
            console.log('StateInspector: State display would be refreshed');
            return this;
        },

        /**
         * Filter the displayed state variables
         * @param {string} filterText - Text to filter by
         * @returns {Object} - The inspector instance for chaining
         */
        filter(filterText) {
            currentFilter = filterText;
            // Implementation will filter the displayed variables
            return this.refresh();
        },

        /**
         * Clean up resources used by the inspector
         */
        destroy() {
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
            panel = null;
            toggleButton = null;
            filterInput = null;
            stateContainer = null;
        }
    };

    return inspector;
}

// Create a default instance
const StateInspector = createStateInspector();

export default StateInspector;
export { createStateInspector };
