jest.autoMockOff();

const glob = require('glob');
const path = require('path');
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const tests = glob.sync('./transforms/__testfixtures__/chai-to-jasmine/*.input.js')
  .map(match => path.parse(match).name)
  .map(match => `/chai-to-jasmine/${match.replace('.input', '')}`);

defineTest(__dirname, 'chai-to-jasmine', null, 'chai-to-jasmine');

tests.forEach((match) => {
  defineTest(
    __dirname,
    'chai-to-jasmine',
    null,
    match
  );
});