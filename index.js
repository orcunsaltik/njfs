/**
 * @typedef {'file' | 'directory'} NodeType
 * @typedef {Object} ListOptions
 * @property {string|string[]} [extensions] - Filter by extension (e.g. 'js' or ['js','ts'])
 * @property {boolean} [recursive=false]   - Walk subdirectories
 * @property {boolean} [fullPath=false]    - Return absolute paths instead of basenames
 */

const fs = require('fs/promises');
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');

/**
 * Convert any path to Unix-style separators (for display / globbing)
 */
const unix = filepath => filepath.replace(/\\/g, '/');

/**
 * Get the current working directory (project root)
 */
const root = () => process.cwd();

/**
 * Check if a path exists
 */
const exists = async filepath => {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Return stats or null if not exists
 */
const statSafe = async filepath => {
  try {
    return await fs.stat(filepath);
  } catch {
    return null;
  }
};

/**
 * Synchronously check node type (kept for rare hot-paths; prefer async)
 */
const lstatSync = require('fs').lstatSync;
const isDirSync = p => {
  try {
    return lstatSync(p).isDirectory();
  } catch {
    return false;
  }
};
const isFileSync = p => {
  try {
    return lstatSync(p).isFile();
  } catch {
    return false;
  }
};

/**
 * Async type checks
 */
const isDir = async p => (await statSafe(p))?.isDirectory() ?? false;
const isFile = async p => (await statSafe(p))?.isFile() ?? false;

/**
 * List entries in a directory
 */
const list = async(dirPath, { extensions, recursive = false, fullPath = false } = {}) => {
  const entries = [];

  const walk = async currentPath => {
    const items = await fs.readdir(currentPath);
    const promises = items.map(async name => {
      const abs = path.join(currentPath, name);

      if (recursive) {
        const stats = await statSafe(abs);
        if (stats?.isDirectory()) {
          await walk(abs);
          return;
        }
      }

      // Extension filter
      if (extensions) {
        const ext = path.extname(name).toLowerCase();
        const allowed = Array.isArray(extensions)
          ? extensions.map(e => '.' + e.replace(/^\.+/, '').toLowerCase())
          : ['.' + extensions.replace(/^\.+/, '').toLowerCase()];
        if (!allowed.includes(ext)) return;
      }

      entries.push(fullPath ? unix(abs) : name);
    });

    await Promise.all(promises);
  };

  await walk(dirPath);
  return entries;
};

/**
 * Ensure a directory exists (mkdir -p)
 */
const mkdirp = dirPath => fs.mkdir(dirPath, { recursive: true });

/**
 * Remove file or directory recursively
 */
const remove = filepath => fs.rm(filepath, { recursive: true, force: true });

/**
 * Read file as string (utf8) or buffer
 */
const readFile = (filepath, encoding = 'utf8') =>
  encoding ? fs.readFile(filepath, encoding) : fs.readFile(filepath);

/**
 * Write file, creating parent directories
 */
const writeFile = async(filepath, content) => {
  const dir = path.dirname(filepath);
  await mkdirp(dir);
  await fs.writeFile(filepath, content, 'utf8');
};

/**
 * Copy a file **or** directory recursively
 */
const copy = async(source, dest) => {
  const srcStat = await statSafe(source);
  if (!srcStat) throw new Error(`Source not found: ${source}`);

  // Normalize destination
  const destDir = path.extname(dest) ? path.dirname(dest) : dest;
  await mkdirp(destDir);

  if (srcStat.isDirectory()) {
    // ---- Directory copy ----
    await mkdirp(dest);
    const items = await fs.readdir(source);
    await Promise.all(items.map(item => copy(path.join(source, item), path.join(dest, item))));
    return dest;
  }

  // ---- File copy ----
  const finalDest = path.extname(dest) ? dest : path.join(dest, path.basename(source));

  // Remove existing destination if any
  if (await exists(finalDest)) await remove(finalDest);

  return new Promise((resolve, reject) => {
    const rs = createReadStream(source);
    const ws = createWriteStream(finalDest);

    rs.pipe(ws);
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('finish', () => resolve(finalDest));
  });
};

/**
 * Move file or directory (rename + fallback copy+delete)
 */
const move = async(source, dest) => {
  const srcStat = await statSafe(source);
  if (!srcStat) throw new Error(`Source not found: ${source}`);

  const finalDest = path.extname(dest) ? dest : path.join(dest, path.basename(source));
  const destDir = path.dirname(finalDest);
  await mkdirp(destDir);

  // Try native rename first (fast, atomic)
  try {
    if (await exists(finalDest)) await remove(finalDest);
    await fs.rename(source, finalDest);
    return finalDest;
  } catch (err) {
    if (err.code !== 'EXDEV') throw err; // not cross-device → rethrow
    // Cross-device: copy then delete
    await copy(source, finalDest);
    await remove(source);
    return finalDest;
  }
};

module.exports = {
  // Core
  copy,
  move,
  list,
  root,
  unix,

  // Async checks
  exists,
  isDir,
  isFile,

  // Sync checks (use sparingly)
  isDirSync,
  isFileSync,

  // Filesystem ops
  remove,
  mkdirp,
  readFile,
  writeFile
};
