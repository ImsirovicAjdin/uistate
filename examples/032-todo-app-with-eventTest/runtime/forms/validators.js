// forms/validators.js — minimal sync/async validation helper
// Shape:
//   validate(model, rules) -> Promise<{ valid: boolean, errorsByField: Record<string,string[]>, errorsGlobal: string[] }>
// Rules shape:
//   {
//     fieldName: [ ruleFn, ... ],
//     _global?: [ ruleFn, ... ]
//   }
// ruleFn signature:
//   (value, model) => string|undefined|Promise<string|undefined>
//   Returns a message when invalid; undefined when valid.

/**
 * @param {any} model
 * @param {Record<string, Array<Function>>} rules
 */
export async function validate(model, rules = {}) {
  const errorsByField = {};
  const errorsGlobal = [];

  const entries = Object.entries(rules).filter(([k]) => k !== '_global');

  for (const [field, fns] of entries) {
    const val = field.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), model);
    for (const fn of fns || []) {
      const res = await fn(val, model);
      if (typeof res === 'string' && res) {
        (errorsByField[field] ||= []).push(res);
      }
    }
  }

  const globals = rules._global || [];
  for (const fn of globals) {
    const res = await fn(model);
    if (typeof res === 'string' && res) errorsGlobal.push(res);
  }

  const valid = Object.keys(errorsByField).length === 0 && errorsGlobal.length === 0;
  return { valid, errorsByField, errorsGlobal };
}

// Some tiny reusable rules
export const Rules = {
  required: (msg = 'This field is required.') => (v) => (v == null || v === '' ? msg : undefined),
  minLen: (n, msg) => (v) => (typeof v === 'string' && v.length < n ? (msg || `Must be at least ${n} characters.`) : undefined),
  pattern: (re, msg) => (v) => (v && !re.test(String(v)) ? (msg || 'Invalid format.') : undefined),
  email: (msg = 'Enter a valid email.') => (v) => (!v ? undefined : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ? undefined : msg),
  // Async example: simulate uniqueness check
  asyncUnique: (checkFn, msg = 'Already taken.') => async (v) => {
    if (!v) return undefined;
    const ok = await checkFn(v);
    return ok ? undefined : msg;
  },
};
