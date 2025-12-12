// stateTracker.dock.dev.js — register a State toggle in dev dock and hide pill (DEV only)
// if (import.meta && import.meta.env && import.meta.env.DEV) {
  const st = window.stateTracker?.instance;
  const dock = window.__devdock;
  if (dock && st) {
    // Hide the pill; dev dock becomes the control surface
    try { st.elements?.pill?.style && (st.elements.pill.style.display = 'none'); } catch {}
    dock.register({ id: 'state-tracker', label: 'State', title: 'Toggle State Tracker', onClick: () => st.toggle() });
  }
// }
