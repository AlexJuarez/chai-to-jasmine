jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'mocha-mix-to-enzyme', null, 'mocha-mix-to-enzyme');
defineTest(__dirname, 'mocha-mix-to-enzyme', null, 'mocha-mix-to-enzyme2');
