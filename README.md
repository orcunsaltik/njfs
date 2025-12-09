# njfs

[![CI](https://github.com/orcunsaltik/njfs/actions/workflows/ci.yml/badge.svg)](https://github.com/orcunsaltik/njfs/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/njfs.svg)](https://www.npmjs.com/package/njfs)
[![npm downloads](https://img.shields.io/npm/dt/njfs.svg)](https://www.npmjs.com/package/njfs)
[![license](https://img.shields.io/npm/l/njfs.svg)](https://github.com/orcunsaltik/njfs/blob/master/LICENSE)

> A collection of Node.js filesystem utility functions

Lightweight utility library providing synchronous and asynchronous filesystem operations for Node.js projects.

## Features

- ✅ Zero dependencies
- ✅ Simple, intuitive API
- ✅ Both sync and async methods
- ✅ Modern Node.js support (18+)
- ✅ TypeScript-friendly with JSDoc
- ✅ Promise-based async operations

## Installation

```bash
npm install njfs
```

## API Reference

### File & Directory Checking

#### `isFile(path)` • Sync

Checks whether the specified path is an existing file.

```javascript
const { isFile } = require('njfs');

if (isFile('./package.json')) {
  console.log('File exists!');
}
```

**Returns:** `boolean`

---

#### `isDir(path)` • Sync

Checks whether the specified path is an existing directory.

```javascript
const { isDir } = require('njfs');

if (isDir('./src')) {
  console.log('Directory exists!');
}
```

**Returns:** `boolean`

---

#### `exists(path)` • Async

Checks whether the specified path exists (file or directory).

```javascript
const { exists } = require('njfs');

if (await exists('./config.json')) {
  console.log('Path exists!');
}
```

**Returns:** `Promise<boolean>`

---

### Directory Operations

#### `list(path, options)` • Async

Returns list of files and folders in the given path.

```javascript
const { list } = require('njfs');

// List all files
const allFiles = await list('./src');

// Filter by extensions
const jsFiles = await list('./src', { extensions: 'js, jsx' });

// Multiple extensions
const files = await list('./src', { extensions: ['js', 'ts', 'jsx'] });
```

**Parameters:**
- `path` (string): Directory path
- `options.extensions` (string | string[]): File extensions to filter

**Returns:** `Promise<string[]>`

---

#### `mkdirp(path)` • Async

Creates directory recursively (like `mkdir -p`). Creates parent directories if they don't exist.

```javascript
const { mkdirp } = require('njfs');

// Creates nested directories
await mkdirp('./dist/assets/images');
```

**Returns:** `Promise<void>`

---

#### `root()` • Sync

Returns the current working directory (project root).

```javascript
const { root } = require('njfs');

const projectRoot = root();
console.log(projectRoot); // '/home/user/my-project'
```

**Returns:** `string`

---

### File Operations

#### `copy(source, destination)` • Async

Copies files from source to destination.

```javascript
const { copy } = require('njfs');

// Copy to directory
await copy('./src/file.js', './dist/');

// Copy with new name
await copy('./src/file.js', './dist/renamed.js');
```

**Returns:** `Promise<string>` - Destination path

---

#### `move(source, destination)` • Async

Moves files from source to destination.

```javascript
const { move } = require('njfs');

// Move to directory
await move('./temp/file.js', './archive/');

// Move with new name
await move('./temp/file.js', './archive/renamed.js');
```

**Returns:** `Promise<string>` - Destination path

---

#### `remove(path)` • Async

Removes file or directory recursively.

```javascript
const { remove } = require('njfs');

// Remove file
await remove('./temp/file.txt');

// Remove directory and all contents
await remove('./temp');
```

**Returns:** `Promise<void>`

---

#### `readFile(path, encoding)` • Async

Reads file contents.

```javascript
const { readFile } = require('njfs');

// Read as UTF-8 (default)
const content = await readFile('./config.json');

// Read with specific encoding
const content = await readFile('./data.txt', 'latin1');
```

**Parameters:**
- `path` (string): File path
- `encoding` (string): File encoding (default: `'utf8'`)

**Returns:** `Promise<string>`

---

#### `writeFile(path, content)` • Async

Writes content to file. Automatically creates parent directories if they don't exist.

```javascript
const { writeFile } = require('njfs');

// Write string
await writeFile('./output/data.txt', 'Hello World');

// Write JSON
await writeFile('./output/config.json', JSON.stringify(config, null, 2));
```

**Returns:** `Promise<void>`

---

### Path Utilities

#### `unix(path)` • Sync

Converts path to Unix-style directory separators.

```javascript
const { unix } = require('njfs');

unix('C:\\Users\\name\\project');
// Returns: 'C:/Users/name/project'
```

**Returns:** `string`

---

## Usage Examples

### Basic File Operations

```javascript
const { copy, move, remove, exists, isFile } = require('njfs');

async function organizeFiles() {
  // Check if file exists
  if (await exists('./temp.txt')) {
    // Copy to backup
    await copy('./temp.txt', './backup/temp.txt');

    // Move to archive
    await move('./temp.txt', './archive/temp.txt');
  }

  // Clean up old files
  if (await exists('./old-data')) {
    await remove('./old-data');
  }
}

organizeFiles();
```

---

### Build Script with Directory Creation

```javascript
const { mkdirp, writeFile, readFile, list } = require('njfs');

async function buildProject() {
  // Ensure output directories exist
  await mkdirp('./dist/assets/js');
  await mkdirp('./dist/assets/css');

  // Process files
  const files = await list('./src', { extensions: 'js' });

  for (const file of files) {
    const content = await readFile(`./src/${file}`);
    const processed = content.toUpperCase(); // Example transformation
    await writeFile(`./dist/assets/js/${file}`, processed);
  }

  console.log('Build complete!');
}

buildProject();
```

---

### Gulp Integration

```javascript
const { list, copy, root, isDir } = require('njfs');
const { src, dest, watch, series } = require('gulp');

async function copyJsFiles() {
  const srcDir = `${root()}/src`;
  const distDir = `${root()}/dist/js`;

  try {
    // Get all JS files
    const files = await list(srcDir, { extensions: 'js, jsx' });

    // Copy each file
    await Promise.all(
      files.map(async (file) => {
        const filePath = `${srcDir}/${file}`;
        if (!isDir(filePath)) {
          await copy(filePath, distDir);
          console.log(`✓ ${file} → ${distDir}`);
        }
      })
    );
  } catch (error) {
    console.error('Copy failed:', error);
  }
}

exports.build = series(copyJsFiles);
exports.watch = () => watch('./src/**/*.js', series(copyJsFiles));
```

---

### File Processing Pipeline

```javascript
const { list, readFile, writeFile, mkdirp, remove } = require('njfs');

async function processMarkdown() {
  // Ensure output directory
  await mkdirp('./output');

  // Get all markdown files
  const files = await list('./content', { extensions: 'md' });

  for (const file of files) {
    // Read file
    const markdown = await readFile(`./content/${file}`);

    // Process (example: convert to uppercase)
    const processed = markdown.toUpperCase();

    // Write output
    const outputFile = file.replace('.md', '.txt');
    await writeFile(`./output/${outputFile}`, processed);
  }

  console.log(`Processed ${files.length} files`);
}

processMarkdown();
```

---

### Batch File Operations

```javascript
const { list, move, exists, mkdirp } = require('njfs');

async function organizeByExtension() {
  const files = await list('./downloads');

  for (const file of files) {
    const sourcePath = `./downloads/${file}`;

    if (await exists(sourcePath)) {
      // Get extension
      const ext = file.split('.').pop();
      const destDir = `./organized/${ext}`;

      // Ensure directory exists
      await mkdirp(destDir);

      // Move file
      await move(sourcePath, destDir);
      console.log(`Moved: ${file} → ${destDir}/`);
    }
  }
}

organizeByExtension();
```

---

## Requirements

- Node.js >= 18.0.0

## Changelog

### v2.0.0 (2025)
- 🚀 **BREAKING:** Requires Node.js 18+
- 🚀 Modernized to use `fs/promises` API
- ✨ Added `exists(path)` - Check if path exists
- ✨ Added `remove(path)` - Recursive delete
- ✨ Added `mkdirp(path)` - Recursive directory creation
- ✨ Added `readFile(path, encoding)` - Read file contents
- ✨ Added `writeFile(path, content)` - Write file contents
- 🐛 Fixed `root()` to use `process.cwd()` instead of `__dirname`
- 🐛 Fixed `isDir()` and `isFile()` to handle missing files gracefully
- 📚 Added comprehensive JSDoc documentation
- 🔧 Improved error handling with descriptive messages
- 🔧 Better path normalization in `copy()` and `move()`

### v1.2.5 (2021)
- Previous stable release

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

When you encounter a problem, please [open an issue](https://github.com/orcunsaltik/njfs/issues). I would be glad to help you find a solution.

## Author

**Orçun Saltık**

- GitHub: [@orcunsaltik](https://github.com/orcunsaltik)
- Email: saltikorcun@gmail.com

## License

[MIT](LICENSE) © Orçun Saltık
