# njfs

[![CI](https://github.com/orcunsaltik/njfs/actions/workflows/ci.yml/badge.svg)](https://github.com/orcunsaltik/njfs/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/njfs.svg)](https://www.npmjs.com/package/njfs)
[![npm downloads](https://img.shields.io/npm/dt/njfs.svg)](https://www.npmjs.com/package/njfs)
[![license](https://img.shields.io/npm/l/njfs.svg)](https://github.com/orcunsaltik/njfs/blob/master/LICENSE)

> A collection of Node.js filesystem utility functions

Production-ready filesystem utilities with zero dependencies. Supports both files and directories, recursive operations, and cross-platform compatibility.

## Features

- ✅ Zero dependencies
- ✅ Simple, intuitive API
- ✅ Async-first with optional sync methods
- ✅ Recursive directory operations
- ✅ Cross-device move support
- ✅ Modern Node.js support (18+)
- ✅ Full TypeScript JSDoc annotations
- ✅ Production-tested

## Installation

```bash
npm install njfs
```

## Quick Start

```javascript
const { copy, list, mkdirp, readFile, writeFile } = require('njfs');

// Copy entire directory
await copy('./src', './dist');

// List files recursively
const files = await list('./src', { recursive: true, extensions: ['js', 'ts'] });

// Create nested directories
await mkdirp('./build/assets/images');

// Read and write files
const content = await readFile('./config.json');
await writeFile('./output/data.json', JSON.stringify(data));
```

## API Reference

### File & Directory Checking

#### `exists(path)` • Async

Check if a path exists (file or directory).

```javascript
const { exists } = require('njfs');

if (await exists('./config.json')) {
  console.log('Config exists!');
}
```

**Returns:** `Promise<boolean>`

---

#### `isFile(path)` • Async

Check if a path is a file.

```javascript
const { isFile } = require('njfs');

if (await isFile('./package.json')) {
  console.log('Is a file!');
}
```

**Returns:** `Promise<boolean>`

---

#### `isDir(path)` • Async

Check if a path is a directory.

```javascript
const { isDir } = require('njfs');

if (await isDir('./src')) {
  console.log('Is a directory!');
}
```

**Returns:** `Promise<boolean>`

---

#### `isFileSync(path)` • Sync

Synchronous version of `isFile`. Use sparingly (blocks event loop).

```javascript
const { isFileSync } = require('njfs');

if (isFileSync('./package.json')) {
  console.log('Is a file!');
}
```

**Returns:** `boolean`

---

#### `isDirSync(path)` • Sync

Synchronous version of `isDir`. Use sparingly (blocks event loop).

```javascript
const { isDirSync } = require('njfs');

if (isDirSync('./src')) {
  console.log('Is a directory!');
}
```

**Returns:** `boolean`

---

### Directory Operations

#### `list(path, options)` • Async

List files and directories with powerful filtering options.

```javascript
const { list } = require('njfs');

// List all entries
const all = await list('./src');

// Filter by extension
const jsFiles = await list('./src', { extensions: 'js' });
const codeFiles = await list('./src', { extensions: ['js', 'ts', 'jsx'] });

// Recursive listing
const allFiles = await list('./src', { recursive: true });

// Get full paths
const paths = await list('./src', {
  recursive: true,
  fullPath: true,
  extensions: ['js', 'json']
});
```

**Options:**

- `extensions` (string | string[]): Filter by file extensions
- `recursive` (boolean): Walk subdirectories (default: `false`)
- `fullPath` (boolean): Return absolute paths instead of names (default: `false`)

**Returns:** `Promise<string[]>`

---

#### `mkdirp(path)` • Async

Create directory recursively (like `mkdir -p`).

```javascript
const { mkdirp } = require('njfs');

// Creates all parent directories
await mkdirp('./dist/assets/images');
```

**Returns:** `Promise<void>`

---

#### `root()` • Sync

Get the current working directory.

```javascript
const { root } = require('njfs');

const projectRoot = root();
console.log(projectRoot); // '/home/user/my-project'
```

**Returns:** `string`

---

### File Operations

#### `copy(source, destination)` • Async

Copy files **or directories** recursively.

```javascript
const { copy } = require('njfs');

// Copy file
await copy('./src/app.js', './dist/app.js');

// Copy file to directory (keeps name)
await copy('./src/app.js', './dist/');

// Copy entire directory recursively
await copy('./src', './dist');

// Copy directory to new location
await copy('./templates', './build/templates');
```

**Returns:** `Promise<string>` - Destination path

---

#### `move(source, destination)` • Async

Move files **or directories** with cross-device support.

```javascript
const { move } = require('njfs');

// Move file
await move('./temp/file.js', './archive/file.js');

// Move to directory (keeps name)
await move('./temp/file.js', './archive/');

// Move entire directory
await move('./old-folder', './new-folder');

// Cross-device move (automatically falls back to copy+delete)
await move('/mnt/drive1/data', '/mnt/drive2/data');
```

**Returns:** `Promise<string>` - Destination path

**Note:** Automatically handles cross-device moves by copying then deleting.

---

#### `remove(path)` • Async

Remove file or directory recursively.

```javascript
const { remove } = require('njfs');

// Remove file
await remove('./temp.txt');

// Remove directory and all contents
await remove('./build');
```

**Returns:** `Promise<void>`

---

#### `readFile(path, encoding)` • Async

Read file contents.

```javascript
const { readFile } = require('njfs');

// Read as UTF-8 (default)
const text = await readFile('./config.json');

// Read as buffer
const buffer = await readFile('./image.png', null);

// Read with specific encoding
const latin = await readFile('./legacy.txt', 'latin1');
```

**Parameters:**

- `path` (string): File path
- `encoding` (string | null): Encoding (default: `'utf8'`, use `null` for buffer)

**Returns:** `Promise<string | Buffer>`

---

#### `writeFile(path, content)` • Async

Write content to file. Creates parent directories automatically.

```javascript
const { writeFile } = require('njfs');

// Write string
await writeFile('./output/data.txt', 'Hello World');

// Write JSON
await writeFile('./config.json', JSON.stringify(config, null, 2));

// Nested path (creates directories)
await writeFile('./build/assets/data.json', content);
```

**Returns:** `Promise<void>`

---

### Path Utilities

#### `unix(path)` • Sync

Convert path to Unix-style separators.

```javascript
const { unix } = require('njfs');

const normalized = unix('C:\\Users\\name\\project');
// Returns: 'C:/Users/name/project'
```

**Returns:** `string`

---

## Usage Examples

### Build Script

```javascript
const { copy, list, mkdirp, remove } = require('njfs');

async function build() {
  // Clean
  await remove('./dist');

  // Create output structure
  await mkdirp('./dist/js');
  await mkdirp('./dist/css');

  // Copy all JavaScript files
  const jsFiles = await list('./src', {
    recursive: true,
    extensions: ['js', 'jsx'],
    fullPath: true
  });

  for (const file of jsFiles) {
    const destPath = file.replace('/src/', '/dist/js/');
    await copy(file, destPath);
  }

  console.log('Build complete!');
}

build();
```

---

### Directory Sync

```javascript
const { copy, list, exists, remove } = require('njfs');

async function syncDirectories(source, target) {
  // Get all files from source
  const sourceFiles = await list(source, {
    recursive: true,
    fullPath: true
  });

  // Remove target if exists
  if (await exists(target)) {
    await remove(target);
  }

  // Copy entire directory
  await copy(source, target);

  console.log(`Synced ${sourceFiles.length} files`);
}

syncDirectories('./source', './backup');
```

---

### File Organization

```javascript
const { list, move, mkdirp, unix } = require('njfs');
const path = require('path');

async function organizeByExtension(sourceDir) {
  const files = await list(sourceDir, { fullPath: true });

  for (const file of files) {
    const ext = path.extname(file).slice(1) || 'no-extension';
    const destDir = `${sourceDir}/organized/${ext}`;

    await mkdirp(destDir);
    await move(file, destDir);

    console.log(`Moved: ${unix(file)} → ${ext}/`);
  }
}

organizeByExtension('./downloads');
```

---

### Recursive File Search

```javascript
const { list, readFile } = require('njfs');

async function searchInFiles(dir, searchText) {
  const files = await list(dir, {
    recursive: true,
    extensions: ['js', 'ts', 'json'],
    fullPath: true
  });

  const matches = [];

  for (const file of files) {
    const content = await readFile(file);
    if (content.includes(searchText)) {
      matches.push(file);
    }
  }

  return matches;
}

const results = await searchInFiles('./src', 'TODO');
console.log(`Found ${results.length} files with TODOs`);
```

---

### Backup System

```javascript
const { copy, mkdirp, unix } = require('njfs');
const path = require('path');

async function createBackup(source, backupRoot) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(backupRoot, timestamp);

  await mkdirp(backupPath);
  await copy(source, backupPath);

  console.log(`Backup created: ${unix(backupPath)}`);
  return backupPath;
}

createBackup('./important-data', './backups');
```

---

### Gulp Integration

```javascript
const { list, copy, root } = require('njfs');
const { series, watch } = require('gulp');

async function copyAssets() {
  const srcDir = `${root()}/assets`;
  const distDir = `${root()}/dist/assets`;

  await copy(srcDir, distDir);
  console.log('✓ Assets copied');
}

async function processScripts() {
  const files = await list('./src', {
    recursive: true,
    extensions: ['js', 'ts']
  });

  console.log(`Processing ${files.length} script files...`);
  // ... your build logic
}

exports.build = series(copyAssets, processScripts);
exports.watch = () => {
  watch('./assets/**/*', copyAssets);
  watch('./src/**/*.{js,ts}', processScripts);
};
```

---

## Requirements

- Node.js >= 18.0.0

## Changelog

### v2.0.0 (2025)

- 🚀 **BREAKING:** Requires Node.js 18+
- 🚀 **BREAKING:** `isDir` and `isFile` are now async (use `isDirSync`/`isFileSync` for sync)
- ✨ **NEW:** `copy` now supports directories recursively
- ✨ **NEW:** `move` now supports directories with cross-device fallback
- ✨ **NEW:** `list` supports `recursive` and `fullPath` options
- ✨ **NEW:** `exists(path)` - Check if path exists
- ✨ **NEW:** `remove(path)` - Recursive delete
- ✨ **NEW:** `mkdirp(path)` - Recursive directory creation
- ✨ **NEW:** `readFile(path, encoding)` - Read file contents
- ✨ **NEW:** `writeFile(path, content)` - Write file with auto-mkdir
- 🐛 Fixed `root()` to use `process.cwd()` instead of `__dirname`
- 🐛 Fixed path normalization bugs on Windows
- 🐛 Fixed stream handling in `copy` to properly await completion
- 📚 Added comprehensive JSDoc documentation
- 🔧 Better error handling and messages
- ⚡ Performance improvements

### v1.2.5 (2021)

- Previous stable release

## Migration from v1.x

```javascript
// v1.x - Sync checks
if (isDir('./src')) {
}

// v2.x - Async checks (recommended)
if (await isDir('./src')) {
}

// v2.x - Sync fallback (use sparingly)
if (isDirSync('./src')) {
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

When you encounter a problem, please [open an issue](https://github.com/orcunsaltik/njfs/issues).

## Credits

Special thanks to Grok AI for architecture review and suggestions.

## Author

**Orçun Saltık**

- GitHub: [@orcunsaltik](https://github.com/orcunsaltik)
- Email: saltikorcun@gmail.com

## License

[MIT](LICENSE) © Orçun Saltık
