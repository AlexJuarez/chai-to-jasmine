const IGNORE_INCLUDES = ['react', 'mocha-mix', 'enzyme', 'radium'];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let mutations = 0;
  const files = {};

  // Find imports
  mutations += root.find(j.ImportDeclaration, {
    source: {
      type: j.StringLiteral.name
    }
  })
  .forEach((p) => {
    files[p.value.source.value] = true;
  }).size();

  // Find require()
  mutations += root.find(j.CallExpression, {
    callee: {
      name: 'require'
    },
    arguments: [{
      type: j.StringLiteral.name
    }]
  })
  .forEach((p) => {
    files[p.value.arguments[0].value] = true;
  }).size();

  // Find unmock
  mutations += root.find(j.CallExpression, {
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
  }).size();

  const unmock = [];

  Object.keys(files)
    .filter(path => IGNORE_INCLUDES.indexOf(path) === -1)
    .forEach((path) => {
      unmock.push(`jest.unmock('${path}');`);
    });

  const output = (source, statements) => `${statements.join('\n')}

${source}`;

  return mutations ? output(file.source, unmock) : null;
};

module.exports.parser = 'babylon';
