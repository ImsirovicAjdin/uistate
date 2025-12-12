# 007 Form Validation - Real-time Feedback

Demonstrates form validation with multiple state paths and computed validity.

## What's Here

- Email and password inputs
- Real-time validation messages
- Submit button enabled only when form is valid
- **No form library needed** - just state and functions

## How It Works

```javascript
// 1. Store input values AND validation state
const store = createEventState({ 
  email: '',
  password: '',
  emailValid: false,
  passwordValid: false
});

// 2. Validate on input change
store.subscribe('email', (value) => {
  const isValid = validateEmail(value);
  store.set('emailValid', isValid);
  // Show error message
});

// 3. Enable submit when all fields valid
store.subscribe('emailValid', updateSubmitButton);
store.subscribe('passwordValid', updateSubmitButton);
```

## Key Insight

**Validation is just derived state.**

- Input values are **source state**
- Validation flags are **derived state**
- Submit button state is **computed from derived state**

Other frameworks need:
- React: `useForm` hooks, validation libraries
- Vue: `v-model` + validation plugins
- Svelte: Stores + validation actions

**EventState:** Just subscribe to inputs, validate, and update state. That's it.

## Run It

Open `index.html` in a browser. Type invalid data to see error messages. Submit button enables when both fields are valid.
