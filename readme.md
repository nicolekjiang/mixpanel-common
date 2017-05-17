# Mixpanel Common
[![Build Status](https://travis-ci.org/mixpanel/mixpanel-common.svg?branch=master)](https://travis-ci.org/mixpanel/mixpanel-common)

- components: low-level pre-styled web components
- report: mixpanel-specific app utilities
- stylesheets: default CSS and importable Stylus mixins
- util: data manipulation utilities
- widgets: composed pre-styled web components

### Style guide

[https://mixpanel.github.io/mixpanel-common/examples/style-guide/index.html](https://mixpanel.github.io/mixpanel-common/examples/style-guide/index.html)

#### publish

```sh
npm run publish-styleguide
```

Publishes the styleguide to a special branch called `gh-pages` that can be used to display the styleguide on github pages.

### Local development of components

- Install dependencies: `npm install`
- Start a server and build continuously: `npm start`
- Open [http://localhost:8080/examples/style-guide/index.html](http://localhost:8080/examples/style-guide-new/index.html)

### Testing with Saucelabs
```sh
SAUCE_USERNAME=<your username> SAUCE_ACCESS_KEY=<your access key> npm run test-sauce
```
