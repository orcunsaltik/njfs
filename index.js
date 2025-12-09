const path = require('path');
const {
  access,
  rename,
  readdir,
  unlink,
  mkdir,
  rm,
  readFile: rf,
  writeFile: wf,
  lstatSync
} = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');

/**
 * Convert path to Unix-style directory separators
 * @param {string} filepath - Path to convert
 * @returns {string} Unix-style path
 */
const unix = (filepath) => filepath.split(/\\+/).join('/');

/**
 * Check if path is a directory
 * @param {string} filepath - Path to check
 * @returns {boolean} True if directory exists
 */
const isDir = (filepath) => {
  try {
    return lstatSync(filepath).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Check if path is a file
 * @param {string} filepath - Path to check
 * @returns {boolean} True if file exists
 */
const isFile = (filepath) => {
  try {
    return lstatSync(filepath).isFile();
  } catch {
    return false;
  }
};

/**
 * Check if path exists (file or directory)
 * @param {string} filepath - Path to check
 * @returns {Promise<boolean>} True if exists
 */
const exists = async(filepath) => {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
};

/**
 * List files and directories in a path
 * @param {string} dirPath - Directory path
 * @param {Object} opts - Options object
 * @param {string|string[]} opts.extensions - File extensions to filter (e.g., 'js' or ['js', 'jsx'])
 * @returns {Promise<string[]>} Array of file/directory names
 */
const list = async(dirPath, opts = {}) => {
  try {
    let files = await readdir(dirPath);

    let ext = opts.extensions;
    if (ext) {
      if (typeof ext === 'string') {
        ext = ext.split(',');
      }
      ext = ext.map((e) => '.' + e.replace(/\.|\s*/g, ''));
      files = files.filter((file) => ext.indexOf(path.extname(file)) > -1);
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
};

/**
 * Get project root directory
 * @returns {string} Root directory path
 */
const root = () => process.cwd();

/**
 * Copy file or directory
 * @param {string} source - Source path
 * @param {string} dest - Destination path
 * @returns {Promise<string>} Destination path
 */
const copy = async(source, dest) => {
  const sep = path.sep;

  source = source.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');
  dest = dest.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');

  const filename = path.basename(source);
  const ext = path.extname(dest);

  let destDir = dest;

  if (!ext) {
    dest = path.join(dest, filename);
  } else {
    destDir = path.dirname(dest);
  }

  try {
    // Check if destination exists and remove it
    if (await exists(dest)) {
      await unlink(dest);
    }

    // Ensure destination directory exists
    await mkdir(destDir, { recursive: true });

    // Copy file
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(source);
      const writeStream = createWriteStream(dest);

      readStream.pipe(writeStream);

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', () => resolve(dest));
    });
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
};

/**
 * Move file or directory
 * @param {string} source - Source path
 * @param {string} dest - Destination path
 * @returns {Promise<string>} Destination path
 */
const move = async(source, dest) => {
  const sep = path.sep;

  source = source.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');
  dest = dest.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');

  const filename = path.basename(source);
  const ext = path.extname(dest);

  if (!ext) {
    dest = path.join(dest, filename);
  }

  try {
    // Check if destination exists and remove it
    if (await exists(dest)) {
      await unlink(dest);
    }

    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    await mkdir(destDir, { recursive: true });

    // Move file
    await rename(source, dest);
    return dest;
  } catch (error) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
};

/**
 * Remove file or directory recursively
 * @param {string} filepath - Path to remove
 * @returns {Promise<void>}
 */
const remove = async(filepath) => {
  try {
    await rm(filepath, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove: ${error.message}`);
  }
};

/**
 * Create directory recursively (like mkdir -p)
 * @param {string} dirPath - Directory path to create
 * @returns {Promise<void>}
 */
const mkdirp = async(dirPath) => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
};

/**
 * Read file contents
 * @param {string} filepath - File path
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {Promise<string>} File contents
 */
const readFile = async(filepath, encoding = 'utf8') => {
  try {
    return await rf(filepath, encoding);
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
};

/**
 * Write content to file
 * @param {string} filepath - File path
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
const writeFile = async(filepath, content) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    await mkdir(dir, { recursive: true });

    await wf(filepath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
};

module.exports = {
  // Original methods
  copy,
  move,
  list,
  root,
  isFile,
  isDir,
  unix,
  // New methods
  exists,
  remove,
  mkdirp,
  readFile,
  writeFile
};
