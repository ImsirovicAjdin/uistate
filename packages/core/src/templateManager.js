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
        }
    };
    
    return manager;
};

// Create a standalone instance that doesn't depend on any state manager
const TemplateManager = createTemplateManager();

export default createTemplateManager;
export { createTemplateManager, TemplateManager };
