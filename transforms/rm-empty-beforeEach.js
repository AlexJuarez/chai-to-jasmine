const rmEmpty = require('./helpers/rm-empty-beforeEach');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let mutations = 0;

  mutations += rmEmpty(j, root);

  return mutations ? root.toSource() : null;
};
