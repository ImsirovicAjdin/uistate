# 011 Async Patterns - Debouncing & Loading States

Demonstrates how to handle async operations with EventState.

## What's Here

- **Debounced search:** Wait for user to stop typing before searching
- **Loading states:** Show loading indicator during async operations
- **Error handling:** Graceful failure with try/catch
- **No async library needed** - just Promises and state

## How It Works

### Debounced Search

```javascript
let searchTimeout = null;

store.subscribe('searchQuery', async (value) => {
  clearTimeout(searchTimeout);
  
  store.set('isSearching', true);
  
  // Wait 300ms before searching
  searchTimeout = setTimeout(async () => {
    const result = await performSearch(value);
    store.set('searchResult', result);
    store.set('isSearching', false);
  }, 300);
});
```

### Loading States

```javascript
document.getElementById('fetchBtn').onclick = async () => {
  store.set('isLoading', true);
  
  try {
    const data = await fetchData();
    store.set('apiData', data);
  } finally {
    store.set('isLoading', false);
  }
};
```

## Key Insight

**Async is just state changes over time.**

Pattern for any async operation:
1. Set loading state to `true`
2. Perform async operation
3. Set result state
4. Set loading state to `false`

Other frameworks need:
- React: `useState` + `useEffect` + cleanup functions
- Vue: `ref` + `watch` + async watchers
- Svelte: Reactive statements + `#await` blocks

**EventState:** Just use async/await in subscribers. That's it.

## Patterns Demonstrated

### 1. Debouncing
Wait for user to stop typing before triggering expensive operations.

### 2. Loading Indicators
Show feedback during async operations to improve UX.

### 3. Disabling Actions
Prevent duplicate requests by disabling buttons during loading.

### 4. Cleanup
Clear timeouts to prevent race conditions.

## Run It

Open `index.html`:
- Type in the search box (notice the 300ms delay)
- Click "Fetch Data" (notice the loading state)

## Try This

Open DevTools Network tab and throttle to "Slow 3G" to see loading states more clearly.

## Real-World Usage

This pattern works for:
- ✅ API calls
- ✅ Autocomplete
- ✅ Form submission
- ✅ File uploads
- ✅ Any async operation

Just manage loading/error/success states in the store.
