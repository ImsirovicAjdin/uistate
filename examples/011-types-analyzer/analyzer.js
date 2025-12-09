import { createEventState } from '../../eventState.js';
import * as parser from '@typescript-eslint/parser';
import fs from 'fs';

const store = createEventState({ types: {}, analysis: {} });

// Parse a TypeScript file and extract types
function analyzeFile(filepath) {
  const code = fs.readFileSync(filepath, 'utf8');
  const ast = parser.parse(code, { sourceType: 'module' });
  
  // Extract interface/type declarations
  ast.body.forEach(node => {
    if (node.type === 'TSInterfaceDeclaration') {
      const name = node.id.name;
      const shape = extractShape(node);
      store.set(`types.${name}`, { shape, filepath });
    }
  });
}

// Extract type shape for comparison
function extractShape(node) {
  return node.body.body.map(prop => ({
    name: prop.key.name,
    type: prop.typeAnnotation?.typeAnnotation?.type
  }));
}

// Detect duplicates
store.subscribe('types.*', () => {
  const types = store.get('types');
  const shapes = new Map();
  
  Object.entries(types).forEach(([name, { shape }]) => {
    const key = JSON.stringify(shape);
    if (!shapes.has(key)) shapes.set(key, []);
    shapes.get(key).push(name);
  });
  
  const duplicates = [...shapes.values()].filter(arr => arr.length > 1);
  store.set('analysis.duplicates', duplicates);
});

// Analyze files
analyzeFile('./src/user.ts');
analyzeFile('./src/person.ts');

// Print report
console.log('Duplicates:', store.get('analysis.duplicates'));
