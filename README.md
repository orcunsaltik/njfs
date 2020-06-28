# njfs
Node Js File System

A small, quick and user friendly async filesystem functions for Node js. 

## Install

``` bash
npm install --save-dev njfs
```

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
