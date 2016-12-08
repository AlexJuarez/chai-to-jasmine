#!/bin/bash
set -x
set -e

jscodeshift $1 -t ./transforms/should-to-expect.js
jscodeshift $1 -t ./transforms/sinon-to-jasmine-spy.js
jscodeshift $1 -t ./transforms/chai-chains-to-jasmine.js
jscodeshift $1 -t ./transforms/chai-expect-to-jasmine.js
