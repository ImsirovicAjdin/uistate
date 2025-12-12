// Auto-generated from test assertions
// DO NOT EDIT - regenerate by running: node tests/generateTypes.js

export interface StoreState {
  domain: {
    todos: {
      items: Array<{ id: number; text: string; done: boolean }>;
    };
  };
  ui: {
    todos: {
      filter: string;
    };
  };
  intent: {
    todo: {
      add: { text: string };
      toggle: { id: number };
    };
  };
}

export default StoreState;
