import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Branding Validation Tests
 * Ensures consistent use of "The L.A.W.S. Collective" throughout the project
 * Catches common branding errors like duplicate "The" instances
 */

describe('Branding Validation', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const filesToCheck = [
    'client/src',
    'server',
    'shared',
    'client/public',
  ];

  const getFilesRecursively = (dir: string): string[] => {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...getFilesRecursively(fullPath));
      } else if (entry.isFile() && /\.(tsx?|md|json)$/.test(entry.name) && entry.name !== 'branding.test.ts') {
        files.push(fullPath);
      }
    }
    return files;
  };

  it('should not contain duplicate "The The" instances', () => {
    const duplicatePattern = /The The /g;
    const violations: string[] = [];

    for (const dir of filesToCheck) {
      const fullDir = path.join(projectRoot, dir);
      if (!fs.existsSync(fullDir)) continue;

      const files = getFilesRecursively(fullDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.match(duplicatePattern);
        if (matches) {
          violations.push(`${file}: Found ${matches.length} instance(s) of "The The"`);
        }
      }
    }

    expect(violations, `Duplicate "The The" found:\n${violations.join('\n')}`).toHaveLength(0);
  });

  it('should use "The L.A.W.S. Collective" consistently', () => {
    const correctPattern = /The L\.A\.W\.S\. Collective/g;
    const incorrectPatterns = [
      { pattern: /LAWS Collective/g, name: 'LAWS Collective (missing periods)' },
      { pattern: /L\.A\.W\.S Collective/g, name: 'L.A.W.S Collective (missing period)' },
      { pattern: /The LAWS Collective/g, name: 'The LAWS Collective (missing periods)' },
    ];

    const violations: string[] = [];

    for (const dir of filesToCheck) {
      const fullDir = path.join(projectRoot, dir);
      if (!fs.existsSync(fullDir)) continue;

      const files = getFilesRecursively(fullDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        for (const { pattern, name } of incorrectPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            violations.push(`${file}: Found ${matches.length} instance(s) of "${name}"`);
          }
        }
      }
    }

    expect(violations, `Branding inconsistencies found:\n${violations.join('\n')}`).toHaveLength(0);
  });

  it('should verify branding is used in key public-facing pages', () => {
    const keyFiles = [
      'client/src/pages/Landing.tsx',
      'client/public/index.html',
    ];

    const brandingPattern = /The L\.A\.W\.S\. Collective/;
    const violations: string[] = [];

    for (const file of keyFiles) {
      const fullPath = path.join(projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        violations.push(`${file}: File not found`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      if (!brandingPattern.test(content)) {
        violations.push(`${file}: Does not contain "The L.A.W.S. Collective"`);
      }
    }

    expect(violations, `Branding missing from key pages:\n${violations.join('\n')}`).toHaveLength(0);
  });
});
