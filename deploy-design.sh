#/bin/bash

set -ex

gsutil -m -h "Cache-Control:private, max-age=0, no-transform" cp -r examples/style-guide-new/* gs://design.mixpanel.com
