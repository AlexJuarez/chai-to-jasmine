module.exports = function (j, root) {
  let mutations = 0;
  mutations += root
    .find(j.ImportDeclaration, {
      source: {
        value: value => value.indexOf('ReactUtils') !== -1 || value.indexOf('TestUtils') !== -1
      }
    })
    .remove()
    .size();

  mutations += root
    .find(j.VariableDeclaration, {
      declarations: [{
        init: {
          name: 'ReactTestUtils'
        }
      }]
    })
    .remove()
    .size();

  mutations += root
    .find(j.VariableDeclarator, {
      init: {
        object: {
          name: 'ReactTestUtils'
        }
      }
    })
    .renameTo('mount')
    .remove()
    .size();

  return mutations;
};
