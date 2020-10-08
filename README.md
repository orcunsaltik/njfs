# njfs
Node Js File System

A small collection of sync & async filesystem functions for Node Js. 

## Install

``` bash
npm install njfs
```

## Methods

1. unix(path): Synchronous. Returns path with unix-like directory separators.
2. root(path): Synchronous. Returns the root directory of the package.
3. list(path): Asynchronous. Return the list of files and folders of the given path.
4. move(path, dest): Asynchronous. Move files or folders.
5. copy(path, dest): Asynchronous. Copy files or folders.
6. isFile(path): Synchronous.
7. isDir(path): Synchronous.

## Usage

``` js
const {move, copy, list, isDir} = require('njfs');

gulp.task('example', async () =>

    await gulp.watch(['./src/**/*.js'], gulp.series('build', async () => {

        const dist = 'vhosts/a';
        const dest = 'vhosts/a/b/c/js';

        try {
            const files = await list(dist);
            await Promise.all(files.map(async (file) => {
                const path = `${dist}/${file}`;
                if (!isDir(path)) {
                    await copy(path, dest);
                    console.log(`${file} transfered to ${dest}`);
                }
            }));
        } catch (e) {
            console.log(e);
        }
    })
));
```
