module.exports = (j, root) => {
  let mutations = 0;

  mutations += root.find(j.ExpressionStatement, {
    expression: {
      callee: {
        name: 'beforeEach'
      },
      arguments: [{
        type: j.ArrowFunctionExpression.name,
        body: {
          type: j.BlockStatement.name,
          body: body => !body.length
        }
      }]
    }
  }).remove().size();

  return mutations;
};
