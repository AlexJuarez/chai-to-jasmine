const getExpectNode = require('./getExpectNode');

module.exports = j => (node, fn) => {
  const expectNode = getExpectNode(j)(node);

  if (expectNode == null || expectNode.arguments == null) {
    return node;
  }

  const args = expectNode.arguments.map(fn);

  return j.callExpression(j.identifier('expect'), args);
};
