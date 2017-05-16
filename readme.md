# Mixpanel Common
[![Build Status](https://travis-ci.org/mixpanel/mixpanel-common.svg?branch=master)](https://travis-ci.org/mixpanel/mixpanel-common)

- components: low-level pre-styled web components
- report: mixpanel-specific app utilities
- stylesheets: default CSS and importable Stylus mixins
- util: data manipulation utilities
- widgets: composed pre-styled web components

### Style guide

[https://mixpanel.github.io/mixpanel-common/examples/style-guide/index.html](https://mixpanel.github.io/mixpanel-common/examples/style-guide/index.html)

### Local development of components

- Install dependencies: `npm install`
- Start a server and build continuously: `npm start`
- Open [http://localhost:8080/examples/style-guide/index.html](http://localhost:8080/examples/style-guide-new/index.html)


### Release Log

#### 0.50.1
 - renamePropertyValue param signature change to (value, header) - header is a new optional field.
    If header is $event / $country_code / $mp_country_code, then value will be expanded.
    Otherwise it will be passed through.

