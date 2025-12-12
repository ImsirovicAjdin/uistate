// boundary.js — Minimal boundary helper for UIstate
// Design goals:
// - Never throw; always resolve to a value (or undefined) so callers can remain declarative
// - Toggle loading flags via provided setLoading(boolean)
// - Report errors via onError(error)
// - Optional mapError(error) to convert errors into return values
// - Optional finally() callback invoked regardless of outcome

/**
 * @template T
 * @param {() => Promise<T>} fn async function to execute within the boundary
 * @param {{
 *   setLoading?: (v:boolean)=>void,
 *   onError?: (error:any)=>void,
 *   mapError?: (error:any)=>any,
 *   finally?: ()=>void,
 * }} opts
 * @returns {Promise<T|any|undefined>}
 */
export async function runWithBoundary(fn, opts = {}){
  const { setLoading, onError, mapError, finally: onFinally } = opts;
  try {
    if (setLoading) try { setLoading(true); } catch {}
    const out = await fn();
    return out;
  } catch (err) {
    try { onError && onError(err); } catch {}
    if (typeof mapError === 'function') {
      try { return mapError(err); } catch { return undefined; }
    }
    return undefined;
  } finally {
    if (setLoading) try { setLoading(false); } catch {}
    if (onFinally) try { onFinally(); } catch {}
  }
}
