// views/home.js — Home route
export async function boot({ store, el, signal }){
  // Artificial 1-second delay to show the loader
  await new Promise(resolve => setTimeout(resolve, 1000));

  const container = document.createElement('main');
  container.style.cssText = 'max-width: 600px; margin: 2rem auto; padding: 0 1rem;';
  container.innerHTML = `
    <h1>Home works!</h1>
    <p>This is the home page of the todo app example.</p>
    <p><a href="/todo-demo" data-link>Go to Todo App Demo →</a></p>
    
    <hr style="margin: 2rem 0;">
    
    <h2>Telemetry Test</h2>
    <p>Counter: <strong id="counter-display">0</strong></p>
    <button id="increment-btn" class="btn">Increment Counter</button>
  `;
  el.appendChild(container);

  // Initialize counter in store
  if (store.get('ui.test.counter') === undefined) {
    store.set('ui.test.counter', 0);
  }

  // Counter display subscription
  const counterDisplay = container.querySelector('#counter-display');
  const updateDisplay = () => {
    const count = store.get('ui.test.counter') || 0;
    counterDisplay.textContent = count;
  };
  const unsub = store.subscribe('ui.test.counter', updateDisplay);
  updateDisplay();

  // Increment button
  const incrementBtn = container.querySelector('#increment-btn');
  incrementBtn.addEventListener('click', () => {
    const current = store.get('ui.test.counter') || 0;
    console.log('[TEST] Incrementing counter from', current, 'to', current + 1);
    store.set('ui.test.counter', current + 1);
  });

  // Cleanup on navigation
  if (signal) signal.addEventListener('abort', () => { unsub(); });
  return () => { unsub(); };
}
