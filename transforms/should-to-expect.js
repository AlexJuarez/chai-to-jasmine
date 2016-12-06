/**
 * Simple transform
 *
 * This transforms chai condition.should.(not).(equal|exist|Throw) => expect(condition).(not)....
 * @param file
 * @param api
 * @returns {*}
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.MemberExpression, {
      property: {
        type: j.Identifier.name,
        name: 'should'
      }
    })
    .replaceWith(p => j.callExpression(j.identifier('expect'), [p.node.object]))
    .toSource();
};

module.exports.parser = 'babylon';
