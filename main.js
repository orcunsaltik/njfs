const path = require('path');
const {
    access,
    rename,
    readdir,
    unlink,
    createReadStream,
    createWriteStream,
    constants,
    lstatSync
} = require('fs');
const crs  = createReadStream;
const cws  = createWriteStream;
const F_OK = constants.F_OK;
const W_OK = constants.W_OK;

const unix = (path) => path.split(/\\+/).join('/');

const isDir = (file) => lstatSync(file).isDirectory();

const isFile = (file) => lstatSync(file).isFile();

const list = async (p, opts) => new Promise((res, rej) => readdir(p, opts, (e, d) => (e ? rej(e) : res(d))));

const root = () => {   
    const sep = path.sep;
    const pwd = (process.env.PWD || process.env.INIT_CWD).split(/\|\//);
    const cfd = __dirname.split(/\|\//);          
    return cfd.slice(0, cfd.indexOf(pwd.slice(-1)[0]) + 1).join(sep);
}; 

const copy = async (file, dest) => {

    const sep = path.sep;

    file = file.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');
    dest = dest.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');

    const fn = path.basename(file);
    const ex = path.extname(dest);

    let dir = dest;

    if (!ex) {
        dest += sep + fn;
    } else {
        dir = dest.substring(0, dest.lastIndexOf(sep));
    }

    await new Promise((res, rej) => access(dest, F_OK | W_OK, () => unlink(dest, () => {
                const frst = crs(file);
                const fwst = cws(path.resolve(dir, fn));
                frst.pipe(fwst);
                frst.on('end', () => res(dest))
                    .on('error', (e) => rej(e));
            })));
};

const move = async (file, dest) => {

    const sep = path.sep;

    file = file.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');
    dest = dest.replace(/\/|\\/g, sep).replace(/[/\\]+$/g, '');

    const fn = path.basename(file);
    const ex = path.extname(dest);

    if (!ex) { dest += sep + fn; } 
    
    await new Promise((res, rej) => access(dest, F_OK | W_OK, () => unlink(dest, () => rename(file, dest, (e) => (e ? rej(e) : res(dest))))));
};

module.exports = {
       copy,
       move,
       list,
       root,
       isFile,
       isDir,
       unix
};
