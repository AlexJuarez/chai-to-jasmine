jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'chai-chains-to-jasmine');
