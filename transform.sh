#!/bin/bash
set -x
set -e

jscodeshift $1 -t ./transforms/sinon-to-jasmine-spy.js
jscodeshift $1 -t ./transforms/chai-to-jasmine.js
jscodeshift $1 -t ./transforms/auto-unmock.js
