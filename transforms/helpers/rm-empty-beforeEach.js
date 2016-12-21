module.exports = function (j, root) {
  root.find(j.ExpressionStatement, {
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
  }).remove();
};
