import { readFileSync } from 'fs';

// Read missing tables list
const missingTables = readFileSync('/tmp/missing_tables.txt', 'utf-8')
  .trim()
  .split('\n')
  .filter(t => t.length > 0);

console.log(`-- Migration to create ${missingTables.length} missing tables`);
console.log(`-- Generated at ${new Date().toISOString()}`);
console.log('');

// Read schema file
const schema = readFileSync('./drizzle/schema.ts', 'utf-8');

// Parse table definitions
const tableRegex = /export const (\w+) = mysqlTable\("([^"]+)",\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gs;

let match;
const tableDefs = {};

while ((match = tableRegex.exec(schema)) !== null) {
  const varName = match[1];
  const tableName = match[2];
  const columns = match[3];
  tableDefs[tableName] = { varName, columns };
}

// Generate SQL for missing tables
for (const tableName of missingTables) {
  if (tableDefs[tableName]) {
    console.log(`-- Table: ${tableName}`);
    console.log(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (`);
    
    // Parse columns
    const columnLines = tableDefs[tableName].columns.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'));
    
    const sqlColumns = [];
    
    for (const line of columnLines) {
      // Match column definitions
      const colMatch = line.match(/^(\w+):\s*(\w+)\(([^)]*)\)/);
      if (colMatch) {
        const [, colName, colType, colArgs] = colMatch;
        let sqlType = '';
        let constraints = '';
        
        // Map Drizzle types to MySQL types
        switch (colType) {
          case 'int':
            sqlType = 'INT';
            break;
          case 'bigint':
            sqlType = 'BIGINT';
            break;
          case 'varchar':
            const lenMatch = colArgs.match(/length:\s*(\d+)/);
            sqlType = `VARCHAR(${lenMatch ? lenMatch[1] : 255})`;
            break;
          case 'text':
            sqlType = 'TEXT';
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
          case 'decimal':
            const precMatch = colArgs.match(/precision:\s*(\d+)/);
            const scaleMatch = colArgs.match(/scale:\s*(\d+)/);
            sqlType = `DECIMAL(${precMatch ? precMatch[1] : 10}, ${scaleMatch ? scaleMatch[1] : 2})`;
            break;
          case 'json':
            sqlType = 'JSON';
            break;
          case 'mysqlEnum':
            // Extract enum values
            const enumMatch = colArgs.match(/\[([^\]]+)\]/);
            if (enumMatch) {
              const values = enumMatch[1];
              sqlType = `ENUM(${values})`;
            } else {
              sqlType = 'VARCHAR(50)';
            }
            break;
          default:
            sqlType = 'TEXT';
        }
        
        // Check for constraints
        if (line.includes('.primaryKey()')) {
          constraints += ' PRIMARY KEY';
        }
        if (line.includes('.autoincrement()')) {
          constraints = ' AUTO_INCREMENT' + constraints;
        }
        if (line.includes('.notNull()')) {
          constraints += ' NOT NULL';
        }
        if (line.includes('.unique()')) {
          constraints += ' UNIQUE';
        }
        if (line.includes('.default(')) {
          const defMatch = line.match(/\.default\(([^)]+)\)/);
          if (defMatch) {
            let defVal = defMatch[1].trim();
            if (defVal === 'sql`CURRENT_TIMESTAMP`' || defVal.includes('CURRENT_TIMESTAMP')) {
              constraints += ' DEFAULT CURRENT_TIMESTAMP';
            } else if (defVal.startsWith('"') || defVal.startsWith("'")) {
              constraints += ` DEFAULT ${defVal}`;
            } else if (defVal === 'false') {
              constraints += ' DEFAULT FALSE';
            } else if (defVal === 'true') {
              constraints += ' DEFAULT TRUE';
            } else {
              constraints += ` DEFAULT ${defVal}`;
            }
          }
        }
        if (line.includes('.defaultNow()')) {
          constraints += ' DEFAULT CURRENT_TIMESTAMP';
        }
        if (line.includes('.onUpdateNow()')) {
          constraints += ' ON UPDATE CURRENT_TIMESTAMP';
        }
        
        sqlColumns.push(`  \`${colName}\` ${sqlType}${constraints}`);
      }
    }
    
    console.log(sqlColumns.join(',\n'));
    console.log(');\n');
  } else {
    console.log(`-- WARNING: Table ${tableName} not found in schema`);
  }
}
