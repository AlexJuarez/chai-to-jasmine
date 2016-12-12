module.exports = j => (chain, args) => {
  const arr = chain.reverse();

  let curr = j.identifier(arr.pop());

  while (chain.length) {
    const temp = j.identifier(arr.pop());
    curr = j.memberExpression(curr, temp);
  }

  return j.callExpression(curr, args);
};
