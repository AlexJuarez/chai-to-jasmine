const IGNORE_INCLUDES = ['react', 'mocha-mix', 'enzyme', 'radium'];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  const files = {};

  // Find imports
  j(file.source)
    .find(j.ImportDeclaration)
    .forEach((p) => {
      files[p.value.source.value] = true;
    });

  // Find require()
  j(file.source)
    .find(j.CallExpression, {
      callee: {
        name: 'require'
      }
    })
    .forEach((p) => {
      files[p.value.arguments[0].value] = true;
    });

  // Find unmock
  j(file.source)
    .find(j.CallExpression, {
      callee: {
        type: j.MemberExpression.name,
        object: {
          name: 'jest'
        },
        property: {
          name: 'unmock'
        }
      }
    })
    .forEach((p) => {
      delete files[p.value.arguments[0].value];
    });

  const unmock = [];

  Object.keys(files)
    .filter(path => IGNORE_INCLUDES.indexOf(path) === -1)
    .forEach((path) => {
      unmock.push(`jest.unmock('${path}');`);
    });

  return `${unmock.join('\n')}

${file.source}`;
};

module.exports.parser = 'babylon';
