module.exports = function (j, root) {
  root
  .find(j.ImportDeclaration, {
    source: {
      value: value => value.indexOf('ReactUtils') !== -1 || value.indexOf('TestUtils') !== -1
    }
  })
  .remove();

  root
  .find(j.VariableDeclaration, {
    declarations: [{
      init: {
        name: 'ReactTestUtils'
      }
    }]
  })
  .remove();

  root
    .find(j.VariableDeclarator, {
      init: {
        object: {
          name: 'ReactTestUtils'
        }
      }
    })
    .renameTo('mount')
    .remove();
};
