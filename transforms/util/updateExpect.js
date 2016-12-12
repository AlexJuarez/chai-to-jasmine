const getExpectNode = require('./getExpectNode');

module.exports = j => (node, fn) => {
  const args = getExpectNode(j)(node).arguments.map(fn);

  return j.callExpression(j.identifier('expect'), args);
};
