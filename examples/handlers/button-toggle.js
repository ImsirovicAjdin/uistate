/**
 * Button Toggle Handler
 * Demonstrates UIstate's approach to component behavior using data attributes for state
 */
export default function setupButtonToggle(UIstate) {
  // Default text variants
  let textOn = 'On';
  let textOff = 'Off';
  
  // Handler object with methods
  const handler = {
    // Initialize the component
    init(element) {
      if (!element) return;
      
      // Set up click handler
      element.addEventListener('click', () => {
        this.toggle(element);
      });
      
      return this;
    },
    
    // Toggle the button state
    toggle(element) {
      // Get current state
      const currentState = element.getAttribute('data-state');
      const newState = currentState === 'active' ? 'inactive' : 'active';
      
      // Update state attribute (DOM as source of truth)
      element.setAttribute('data-state', newState);
      
      // Update button text based on state
      const textElement = element.querySelector('.button-toggle-text');
      if (textElement) {
        textElement.textContent = newState === 'active' ? textOff : textOn;
      }
      
      // Dispatch custom event for other components to react
      const event = new CustomEvent('button-toggle', {
        bubbles: true,
        detail: { active: newState === 'active' }
      });
      element.dispatchEvent(event);
    },
    
    // Set custom text variants
    setTextVariants(onText, offText) {
      textOn = onText || 'On';
      textOff = offText || 'Off';
      return this;
    }
  };
  
  // Find all button-toggle elements and initialize them
  const elements = document.querySelectorAll('.button-toggle');
  elements.forEach(element => handler.init(element));
  
  // Return the handler for external use
  return handler;
}