// Auto-generated from test assertions
// DO NOT EDIT - regenerate by running: node tests/generateTypes.js

export interface StoreState {
  todos: {
    items: Array<{ id: number; text: string; done: boolean }>;
    filter: string;
  };
  ui: {
    route: {
      path: string;
      view: string;
    };
    theme: string;
  };
}

export default StoreState;
