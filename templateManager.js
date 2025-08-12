/**
 * TemplateManager - Component mounting and event delegation
 * Handles HTML templating, component mounting, and event delegation
 */

const createTemplateManager = (stateManager) => {
    const manager = {
        handlers: {},
        
        onAction(action, handler) {
            this.handlers[action] = handler;
            return this;
        },
        
        /**
         * Register multiple actions with their handlers in a declarative way
         * @param {Object} actionsMap - Map of action names to handlers or handler configs
         * @returns {Object} - The manager instance for chaining
         * 
         * Example usage:
         * templateManager.registerActions({
         *   'add-item': addItem,
         *   'delete-item': { fn: deleteItem, extractId: true },
         *   'toggle-state': toggleState
         * });
         */
        registerActions(actionsMap) {
            Object.entries(actionsMap).forEach(([action, handler]) => {
                if (typeof handler === 'function') {
                    // Simple function handler
                    this.onAction(action, handler);
                } else if (typeof handler === 'object' && handler !== null) {
                    // Handler with configuration
                    const { fn, extractId = true, idAttribute = 'id' } = handler;
                    
                    if (typeof fn !== 'function') {
                        throw new Error(`Handler for action '${action}' must be a function`);
                    }
                    
                    this.onAction(action, (e) => {
                        if (extractId) {
                            const target = e.target.closest('[data-action]');
                            // Look for common ID attributes in order of preference
                            const id = target.dataset[idAttribute] || 
                                      target.dataset.actionId || 
                                      target.dataset.cardId || 
                                      target.dataset.itemId;
                                      
                            fn(id, e, target);
                        } else {
                            fn(e);
                        }
                    });
                } else {
                    throw new Error(`Invalid handler for action '${action}'`);
                }
            });
            return this;
        },
        
        attachDelegation(root = document.body) {
            root.addEventListener('click', e => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                
                const action = target.dataset.action;
                if (!action) return;
                
                const handler = this.handlers[action];
                if (typeof handler === 'function') {
                    handler(e);
                } else if (target.dataset.value !== undefined && stateManager) {
                    // If we have a state manager, use it to update state
                    stateManager.setState(action, target.dataset.value);
                }
            });
            return this;
        },
        
        /**
         * Render a template from a CSS variable
         * @param {string} templateName - Name of the template (will be prefixed with --template-)
         * @param {Object} data - Data to inject into the template
         * @returns {HTMLElement} - The rendered element
         */
        renderTemplateFromCss(templateName, data = {}) {
            const cssTemplate = getComputedStyle(document.documentElement)
                .getPropertyValue(`--template-${templateName}`)
                .trim()
                .replace(/^['"]|['"]$/g, ''); // Remove surrounding quotes
            
            if (!cssTemplate) throw new Error(`Template not found in CSS: --template-${templateName}`);
            
            let html = cssTemplate;
            
            // Replace all placeholders with actual data
            Object.entries(data).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, value);
            });
            
            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Return the first child (the rendered template)
            return temp.firstElementChild;
        },
        
        mount(componentName, container) {
            const tpl = document.getElementById(`${componentName}-template`);
            if (!tpl) throw new Error(`Template not found: ${componentName}-template`);
            const clone = tpl.content.cloneNode(true);
            
            function resolvePlaceholders(fragment) {
                Array.from(fragment.querySelectorAll('*')).forEach(el => {
                    const tag = el.tagName.toLowerCase();
                    if (tag.endsWith('-placeholder')) {
                        const name = tag.replace('-placeholder','');
                        const childTpl = document.getElementById(`${name}-template`);
                        if (!childTpl) throw new Error(`Template not found: ${name}-template`);
                        const childClone = childTpl.content.cloneNode(true);
                        resolvePlaceholders(childClone);
                        el.replaceWith(childClone);
                    }
                });
            }
            
            resolvePlaceholders(clone);
            container.appendChild(clone);
            return clone.firstElementChild;
        },
        
        // Helper to create a reactive component with automatic updates
        createComponent(name, renderFn, stateKeys = []) {
            if (!stateManager) {
                throw new Error('State manager is required for reactive components');
            }
            
            // Create template element if it doesn't exist
            let tpl = document.getElementById(`${name}-template`);
            if (!tpl) {
                tpl = document.createElement('template');
                tpl.id = `${name}-template`;
                document.body.appendChild(tpl);
            }
            
            // Initial render
            tpl.innerHTML = renderFn(stateManager);
            
            // Set up observers for reactive updates
            if (stateKeys.length > 0) {
                stateKeys.forEach(key => {
                    stateManager.observe(key, () => {
                        tpl.innerHTML = renderFn(stateManager);
                    });
                });
            }
            
            return {
                mount: (container) => this.mount(name, container)
            };
        },
        
        /**
         * Apply CSS classes to an element based on a state key stored in CSS variables
         * @param {HTMLElement} element - Element to apply classes to
         * @param {string} stateKey - State key to look up in CSS variables
         * @param {Object} options - Options for class application
         * @returns {HTMLElement} - The element for chaining
         * 
         * Example usage:
         * // CSS: :root { --card-primary-classes: "bg-primary text-white"; }
         * templateManager.applyClassesFromState(cardElement, 'card-primary');
         */
        applyClassesFromState(element, stateKey, options = {}) {
            if (!element) return element;
            
            const { 
                prefix = '',
                clearExisting = false,
                namespace = '' 
            } = typeof options === 'string' ? { prefix: options } : options;
            
            const prefixPath = prefix ? `${prefix}-` : '';
            const namespacePath = namespace ? `${namespace}-` : '';
            
            const classString = getComputedStyle(document.documentElement)
                .getPropertyValue(`--${namespacePath}${stateKey}-classes`)
                .trim()
                .replace(/^['"]|['"]$/g, '');
                
            if (classString) {
                // Clear existing classes if specified
                if (clearExisting) {
                    element.className = '';
                }
                
                // Add new classes
                classString.split(' ').forEach(cls => {
                    if (cls) element.classList.add(cls);
                });
            }
            
            return element; // For chaining
        }
    };
    
    return manager;
};

// Create a standalone instance that doesn't depend on any state manager
const TemplateManager = createTemplateManager();

export default createTemplateManager;
export { createTemplateManager, TemplateManager };
