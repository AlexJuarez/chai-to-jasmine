module.exports = function (j, source) {
  const body = j(source)
    .find(j.ImportDeclaration, {
      source: {
        value: value => value.indexOf('ReactUtils') !== -1 || value.indexOf('TestUtils') !== -1
      }
    })
    .remove()
    .toSource();

  return j(body)
    .find(j.VariableDeclaration, {
      declarations: [{
        init: {
          name: 'ReactTestUtils'
        }
      }]
    })
    .remove()
    .toSource();
}
