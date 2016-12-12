module.exports = j => (node) => {
  let curr = node;

  while (curr.type === j.MemberExpression.name ||
  (curr.type === j.CallExpression.name && curr.callee.name !== 'expect')) {
    if (curr.type === j.MemberExpression.name) {
      curr = curr.object;
    } else if (curr.type === j.CallExpression.name) {
      curr = curr.callee;
    }
  }

  return curr;
};
