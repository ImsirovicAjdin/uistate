// typeGenerator.js — Generate TypeScript definitions from telemetry
// Analyzes runtime telemetry to extract state shape and generate .d.ts files

import store from '../app/store.js';

class TypeGenerator {
  constructor() {
    this.pathTypes = new Map(); // path → type info
    this.pathSamples = new Map(); // path → sample values
  }

  /**
   * Observe a state change and infer its type
   */
  observe(path, value) {
    const type = this.inferType(value);
    
    // Store sample for complex types
    if (typeof value === 'object' && value !== null) {
      if (!this.pathSamples.has(path)) {
        this.pathSamples.set(path, []);
      }
      const samples = this.pathSamples.get(path);
      if (samples.length < 10) {
        samples.push(value);
      }
    }
    
    // Merge with existing type info
    if (this.pathTypes.has(path)) {
      const existing = this.pathTypes.get(path);
      this.pathTypes.set(path, this.mergeTypes(existing, type));
    } else {
      this.pathTypes.set(path, type);
    }
  }

  /**
   * Infer TypeScript type from a value
   */
  inferType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Array<unknown>';
      
      // Sample first few elements and merge their types
      const samples = value.slice(0, 10);
      let mergedElementType = null;
      
      for (const sample of samples) {
        const elementType = this.inferType(sample);
        if (mergedElementType === null) {
          mergedElementType = elementType;
        } else {
          mergedElementType = this.mergeTypes(mergedElementType, elementType);
        }
      }
      
      return `Array<${this.typeToString(mergedElementType)}>`;
    }
    
    if (typeof value === 'object') {
      // Infer object shape
      const shape = {};
      for (const [key, val] of Object.entries(value)) {
        shape[key] = this.inferType(val);
      }
      return shape;
    }
    
    // Primitives
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    
    return 'unknown';
  }

  /**
   * Convert type representation to string
   */
  typeToString(type) {
    if (typeof type === 'string') return type;
    
    if (typeof type === 'object' && !Array.isArray(type)) {
      const props = Object.entries(type)
        .map(([k, v]) => `${k}: ${this.typeToString(v)}`)
        .join('; ');
      return `{ ${props} }`;
    }
    
    return 'unknown';
  }

  /**
   * Merge two type definitions (for union types)
   */
  mergeTypes(type1, type2) {
    // Normalize for comparison
    const str1 = this.normalizeType(type1);
    const str2 = this.normalizeType(type2);
    
    if (str1 === str2) return type1;
    
    // Handle string types
    if (typeof type1 === 'string' && typeof type2 === 'string') {
      if (type1 === type2) return type1;
      // Avoid duplicate unions
      if (type1.includes(type2)) return type1;
      if (type2.includes(type1)) return type2;
      return `${type1} | ${type2}`;
    }
    
    // Handle object merging (merge properties, not create union)
    if (typeof type1 === 'object' && typeof type2 === 'object' && 
        !Array.isArray(type1) && !Array.isArray(type2)) {
      const merged = { ...type1 };
      for (const [key, val] of Object.entries(type2)) {
        if (key in merged) {
          merged[key] = this.mergeTypes(merged[key], val);
        } else {
          merged[key] = val;
        }
      }
      return merged;
    }
    
    // Mixed types: create union
    if (typeof type1 === 'string' && typeof type2 === 'object') {
      return `${type1} | ${this.typeToString(type2)}`;
    }
    if (typeof type1 === 'object' && typeof type2 === 'string') {
      return `${this.typeToString(type1)} | ${type2}`;
    }
    
    return type1; // Default: keep first type
  }

  /**
   * Normalize type for comparison
   */
  normalizeType(type) {
    if (typeof type === 'string') return type;
    return JSON.stringify(type, Object.keys(type).sort());
  }

  /**
   * Build hierarchical tree from flat paths
   */
  buildTree() {
    const tree = {};
    
    for (const [path, type] of this.pathTypes) {
      const parts = path.split('.');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          // Leaf node
          current[part] = { __type: type };
        } else {
          // Branch node
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
    
    return tree;
  }

  /**
   * Generate TypeScript interface from type info
   */
  generateInterface(obj, indent = 0) {
    const lines = [];
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (value.__type !== undefined) {
        // Leaf node with type
        const type = this.formatType(value.__type);
        lines.push(`${spaces}${key}: ${type};`);
      } else {
        // Nested object
        lines.push(`${spaces}${key}: {`);
        lines.push(this.generateInterface(value, indent + 1));
        lines.push(`${spaces}};`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Format type for TypeScript output
   */
  formatType(type) {
    if (typeof type === 'string') {
      return type;
    }
    
    if (typeof type === 'object' && !Array.isArray(type)) {
      // Inline object type
      const props = Object.entries(type)
        .map(([k, v]) => `${k}: ${this.formatType(v)}`)
        .join('; ');
      return `{ ${props} }`;
    }
    
    return 'unknown';
  }

  /**
   * Generate complete .d.ts file
   */
  generateDTS() {
    const lines = [
      '// Auto-generated from runtime telemetry',
      '// DO NOT EDIT - regenerate by using the app and clicking "Generate Types"',
      '',
      'export interface StoreState {',
    ];
    
    const tree = this.buildTree();
    lines.push(this.generateInterface(tree, 1));
    lines.push('}');
    lines.push('');
    lines.push('export default StoreState;');
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Parse telemetry buffer and extract types
   */
  parseBuffer(buffer) {
    for (const entry of buffer) {
      if (entry.level !== 'log') continue;
      
      const args = entry.args;
      if (!args || args.length < 2) continue;
      
      const tag = args[0];
      
      // Parse [state] entries
      if (typeof tag === 'string' && tag.startsWith('[state]')) {
        const path = tag.replace('[state] ', '');
        const value = args[1];
        this.observe(path, value);
      }
      
      // Parse [intent] entries
      if (typeof tag === 'string' && tag.startsWith('[intent]')) {
        const intentName = tag.replace('[intent] ', '');
        const path = `intent.${intentName}`;
        const value = args[1];
        this.observe(path, value);
      }
    }
  }

  /**
   * Parse test assertions and extract types
   */
  parseTestAssertions(assertions) {
    for (const assertion of assertions) {
      const { path, type, elementShape, shape } = assertion;
      
      if (type === 'array' && elementShape) {
        // Array type with element shape
        this.pathTypes.set(path, `Array<${this.typeToString(elementShape)}>`);
      } else if (type === 'object' && shape) {
        // Object type with shape
        this.pathTypes.set(path, shape);
      } else if (type) {
        // Primitive type
        this.pathTypes.set(path, type);
      }
    }
  }

  /**
   * Save .d.ts file (browser download)
   */
  save(filename = 'store.d.ts') {
    const dts = this.generateDTS();
    const blob = new Blob([dts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create and expose type generator
const typeGenerator = new TypeGenerator();
window.__typeGenerator = typeGenerator;

// Subscribe to all state changes for live type inference
if (store && store.subscribe) {
  store.subscribe('*', (detail) => {
    const { path, value } = detail;
    typeGenerator.observe(path, value);
  });
  
  console.info('[typeGenerator] Live type inference enabled');
}

// Register with dev dock
if (window.__devdock && typeof window.__devdock.register === 'function') {
  window.__devdock.register({
    id: 'generate-types',
    label: 'Types',
    title: 'Generate TypeScript definitions',
    onClick: () => {
      // Also parse telemetry buffer for historical data
      if (window.__telemetry) {
        const buffer = window.__telemetry.get();
        typeGenerator.parseBuffer(buffer);
      }
      
      typeGenerator.save('store.d.ts');
      console.info('[typeGenerator] Generated store.d.ts');
    }
  });
}

export default typeGenerator;
export { TypeGenerator };
