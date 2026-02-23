import { readFileSync } from 'fs';

// Read missing tables list
const missingTables = new Set(
  readFileSync('/tmp/missing_tables.txt', 'utf-8')
    .trim()
    .split('\n')
    .filter(t => t.length > 0)
);

console.log(`-- Migration to create ${missingTables.size} missing tables`);
console.log(`-- Generated at ${new Date().toISOString()}`);
console.log('SET FOREIGN_KEY_CHECKS = 0;');
console.log('');

// Read schema file
const schema = readFileSync('./drizzle/schema.ts', 'utf-8');

// More comprehensive regex to capture full table definitions including nested objects
function extractTableDefinitions(content) {
  const tables = {};
  let depth = 0;
  let currentTable = null;
  let currentTableName = null;
  let tableContent = '';
  let inTable = false;
  
  // Split by lines and process
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for table start
    const tableMatch = line.match(/export const (\w+) = mysqlTable\("([^"]+)"/);
    if (tableMatch) {
      currentTable = tableMatch[1];
      currentTableName = tableMatch[2];
      tableContent = line;
      inTable = true;
      depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      // Check if table ends on same line
      if (depth <= 0 && line.includes(');')) {
        tables[currentTableName] = tableContent;
        inTable = false;
        currentTable = null;
      }
      continue;
    }
    
    if (inTable) {
      tableContent += '\n' + line;
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      // Check for table end
      if (line.includes(');') && depth <= 0) {
        tables[currentTableName] = tableContent;
        inTable = false;
        currentTable = null;
      }
    }
  }
  
  return tables;
}

const tableDefs = extractTableDefinitions(schema);

// Parse column definition
function parseColumn(line) {
  // Clean up the line
  line = line.trim();
  if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
    return null;
  }
  
  // Match column name and type
  const colMatch = line.match(/^(\w+):\s*(\w+)\(/);
  if (!colMatch) return null;
  
  const colName = colMatch[1];
  const colType = colMatch[2];
  
  let sqlType = '';
  let constraints = [];
  
  // Extract type arguments
  const typeArgsMatch = line.match(/\w+\(([^)]*(?:\([^)]*\)[^)]*)*)\)/);
  const typeArgs = typeArgsMatch ? typeArgsMatch[1] : '';
  
  // Map Drizzle types to MySQL types
  switch (colType) {
    case 'int':
      sqlType = 'INT';
      break;
    case 'bigint':
      sqlType = 'BIGINT';
      break;
    case 'smallint':
      sqlType = 'SMALLINT';
      break;
    case 'tinyint':
      sqlType = 'TINYINT';
      break;
    case 'varchar': {
      const lenMatch = typeArgs.match(/length:\s*(\d+)/);
      sqlType = `VARCHAR(${lenMatch ? lenMatch[1] : 255})`;
      break;
    }
    case 'char': {
      const lenMatch = typeArgs.match(/length:\s*(\d+)/);
      sqlType = `CHAR(${lenMatch ? lenMatch[1] : 1})`;
      break;
    }
    case 'text':
      sqlType = 'TEXT';
      break;
    case 'longtext':
      sqlType = 'LONGTEXT';
      break;
    case 'mediumtext':
      sqlType = 'MEDIUMTEXT';
      break;
    case 'boolean':
      sqlType = 'BOOLEAN';
      break;
    case 'timestamp':
      sqlType = 'TIMESTAMP';
      break;
    case 'datetime':
      sqlType = 'DATETIME';
      break;
    case 'date':
      sqlType = 'DATE';
      break;
    case 'time':
      sqlType = 'TIME';
      break;
    case 'decimal': {
      const precMatch = typeArgs.match(/precision:\s*(\d+)/);
      const scaleMatch = typeArgs.match(/scale:\s*(\d+)/);
      sqlType = `DECIMAL(${precMatch ? precMatch[1] : 10}, ${scaleMatch ? scaleMatch[1] : 2})`;
      break;
    }
    case 'float':
      sqlType = 'FLOAT';
      break;
    case 'double':
      sqlType = 'DOUBLE';
      break;
    case 'json':
      sqlType = 'JSON';
      break;
    case 'blob':
      sqlType = 'BLOB';
      break;
    case 'binary': {
      const lenMatch = typeArgs.match(/length:\s*(\d+)/);
      sqlType = `BINARY(${lenMatch ? lenMatch[1] : 1})`;
      break;
    }
    case 'varbinary': {
      const lenMatch = typeArgs.match(/length:\s*(\d+)/);
      sqlType = `VARBINARY(${lenMatch ? lenMatch[1] : 255})`;
      break;
    }
    case 'mysqlEnum': {
      // Extract enum values from the array
      const enumMatch = typeArgs.match(/\[([^\]]+)\]/);
      if (enumMatch) {
        sqlType = `ENUM(${enumMatch[1]})`;
      } else {
        sqlType = 'VARCHAR(50)';
      }
      break;
    }
    default:
      sqlType = 'TEXT';
  }
  
  // Check for constraints
  if (line.includes('.autoincrement()')) {
    constraints.push('AUTO_INCREMENT');
  }
  if (line.includes('.primaryKey()')) {
    constraints.push('PRIMARY KEY');
  }
  if (line.includes('.notNull()')) {
    constraints.push('NOT NULL');
  }
  if (line.includes('.unique()')) {
    constraints.push('UNIQUE');
  }
  
  // Handle defaults
  if (line.includes('.defaultNow()')) {
    if (sqlType === 'TIMESTAMP' || sqlType === 'DATETIME') {
      constraints.push('DEFAULT CURRENT_TIMESTAMP');
    }
  } else if (line.includes('.default(')) {
    const defMatch = line.match(/\.default\(([^)]+)\)/);
    if (defMatch) {
      let defVal = defMatch[1].trim();
      if (defVal === 'sql`CURRENT_TIMESTAMP`' || defVal.includes('CURRENT_TIMESTAMP')) {
        constraints.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (defVal === 'false') {
        constraints.push('DEFAULT FALSE');
      } else if (defVal === 'true') {
        constraints.push('DEFAULT TRUE');
      } else if (defVal.match(/^-?\d+$/)) {
        constraints.push(`DEFAULT ${defVal}`);
      } else if (defVal.startsWith('"') || defVal.startsWith("'")) {
        constraints.push(`DEFAULT ${defVal}`);
      } else if (defVal === '0' || defVal === '1') {
        constraints.push(`DEFAULT ${defVal}`);
      }
    }
  }
  
  // Handle ON UPDATE
  if (line.includes('.onUpdateNow()')) {
    constraints.push('ON UPDATE CURRENT_TIMESTAMP');
  }
  
  return {
    name: colName,
    type: sqlType,
    constraints: constraints.join(' ')
  };
}

// Generate SQL for each missing table
for (const tableName of missingTables) {
  if (!tableDefs[tableName]) {
    console.log(`-- WARNING: Table ${tableName} not found in schema`);
    continue;
  }
  
  const tableDef = tableDefs[tableName];
  
  // Extract columns section (between first { and the closing })
  const columnsMatch = tableDef.match(/mysqlTable\("[^"]+",\s*\{([\s\S]*)\}\s*(?:,|\))/);
  if (!columnsMatch) {
    console.log(`-- WARNING: Could not parse columns for ${tableName}`);
    continue;
  }
  
  const columnsSection = columnsMatch[1];
  const lines = columnsSection.split('\n');
  
  const columns = [];
  
  for (const line of lines) {
    const col = parseColumn(line);
    if (col) {
      columns.push(col);
    }
  }
  
  if (columns.length === 0) {
    console.log(`-- WARNING: No columns found for ${tableName}`);
    continue;
  }
  
  console.log(`-- Table: ${tableName}`);
  console.log(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (`);
  
  const colDefs = columns.map(col => {
    let def = `  \`${col.name}\` ${col.type}`;
    if (col.constraints) {
      def += ' ' + col.constraints;
    }
    return def;
  });
  
  console.log(colDefs.join(',\n'));
  console.log(');\n');
}

console.log('SET FOREIGN_KEY_CHECKS = 1;');
