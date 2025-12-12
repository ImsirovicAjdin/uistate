// forms/meta.js — touched/dirty helpers and simple a11y reflection
// Generic, path-agnostic helpers. Caller passes concrete value/meta paths.

/**
 * Initialize field meta with an initial value.
 * @param {any} store
 * @param {{ valuePath: string, metaPath: string, initialValue?: any }} opts
 */
export function initFieldMeta(store, { valuePath, metaPath, initialValue }) {
  const init = (typeof initialValue !== 'undefined') ? initialValue : store.get(valuePath);
  store.set(`${metaPath}.initial`, init);
  store.set(`${metaPath}.touched`, false);
  store.set(`${metaPath}.dirty`, false);
  store.set(`${metaPath}.invalid`, false);
}

/** Mark as touched (e.g., on blur) */
export function markTouched(store, metaPath) {
  store.set(`${metaPath}.touched`, true);
}

/** Update dirty flag by comparing current value to initial */
export function updateDirty(store, { valuePath, metaPath }) {
  const current = store.get(valuePath);
  const initial = store.get(`${metaPath}.initial`);
  store.set(`${metaPath}.dirty`, current !== initial);
}

/** Reset meta flags (preserves initial) */
export function resetFieldMeta(store, metaPath) {
  store.set(`${metaPath}.touched`, false);
  store.set(`${metaPath}.dirty`, false);
  store.set(`${metaPath}.invalid`, false);
}

/** Reset value to initial and clear flags */
export function resetToInitial(store, { valuePath, metaPath }) {
  const initial = store.get(`${metaPath}.initial`);
  store.set(valuePath, initial);
  resetFieldMeta(store, metaPath);
}

/**
 * Reflect invalid based on errorsByField[fieldKey].length
 * @param {any} store
 * @param {{ metaPath: string, errorsByField: Record<string, string[]>, fieldKey: string }} opts
 */
export function reflectInvalid(store, { metaPath, errorsByField, fieldKey }) {
  const invalid = Array.isArray(errorsByField?.[fieldKey]) && errorsByField[fieldKey].length > 0;
  store.set(`${metaPath}.invalid`, invalid);
}
