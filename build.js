/* global require, process */

'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const watch = require('watch');

const INPUT_DIR = 'lib';
const OUTPUT_DIR = 'build';

const babel = require('babel-core');
const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

const CONFIGS = [
  {
    matches: /lib\/(?!stylesheets)/,
    transpilers: {
      js: file => {
        return babel.transformFileSync(file, babelrc).code;
      },

      jade: file => {
        const source = fs.readFileSync(file).toString();
        const vjade = require('virtual-jade');
        const vjadeOptions = {
          filename: file,
          name: '_jade_template_fn',
          pretty: true,
        };
        const compiled = vjade(source, vjadeOptions) + '\nmodule.exports = _jade_template_fn;';
        const transpiled = babel.transform(compiled, babelrc).code;
        return transpiled;
      },

      styl: file => {
        const source = fs.readFileSync(file).toString();
        const stylus = require('stylus');
        const autoprefixer = require('autoprefixer-stylus');
        const css = stylus(source)
          .include(path.dirname(file))
          .include(path.resolve('./node_modules'))
          .use(autoprefixer())
          .render()
          .replace(/\n/g, ' ')
          .replace(/"/g, '\\"');
        return 'module.exports = "' + css + '";\n';
      },
    },
  },

  {
    matches: /lib\/stylesheets/,
    transpilers: {
      // styl
    },
  },
];

function transpileFile(file) {
  const config = CONFIGS.find(config => config.matches.test(file));
  if (!config) {
    console.log(`No matching config found for ${file}`);
    return;
  }

  const ext = file.split('.').pop();
  const transpiler = config.transpilers[ext];
  if (!transpiler) {
    console.log(`No transpiler found for ${file}`);
    return;
  }

  const outputFile = file.replace(INPUT_DIR, OUTPUT_DIR);
  ensureDir(path.dirname(outputFile));
  fs.writeFileSync(outputFile, transpiler(file));
  console.log(file, '=>', outputFile);
}

function ensureDir(target) {
  // Create dir recursively if it does not exist!
  target.split('/').forEach((dir, index, splits) => {
    const parent = splits.slice(0, index).join('/');
    const dirPath = path.resolve(parent, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
}

function compileFiles() {
  glob(INPUT_DIR + '/**/*.?(js|jade|styl)', (err, files) => {
    if (err) {
      throw err;
    } else {
      files.forEach(file => transpileFile(file)) ;
    }
  });
}

function watchFiles() {
  watch.watchTree(INPUT_DIR, (file, curr, prev) => {
    if (typeof file === 'object' && prev === null && curr === null) {
      // Finished walking the tree
    } else if (prev === null) {
      // file is a new file
    } else if (curr.nlink === 0) {
      // file was removed
    } else {
      // file was changed
      try {
        transpileFile(file);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

const argv = require('minimist')(process.argv.slice(2));
compileFiles();
if (argv['w'] || argv['watch']) {
  watchFiles();
}
