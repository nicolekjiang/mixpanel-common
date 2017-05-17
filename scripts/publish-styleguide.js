#!/usr/bin/env node
const ghPages=require('gh-pages');
const execSync=require('child_process').execSync;

execSync('npm run build')
ghPages.publish('examples/style-guide')
