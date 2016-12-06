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

  const body = j(file.source)
    .find(j.MemberExpression, {
      property: {
        type: j.Identifier.name,
        name: 'should'
      }
    })
    .replaceWith(p => j.callExpression(j.identifier('expect'), [p.node.object]))
    .toSource();

    const isExpectCall = (node) => node.name === 'expect' ||
      node.type === j.MemberExpression.name &&
      isExpectCall(node.object) ||
      node.type === j.CallExpression.name &&
        isExpectCall(node.callee);

    return j(body)
      .find(j.MemberExpression, {
        property: {
          name: name => ['exist', 'equal', 'Throw'].indexOf(name) >= 0,
        },
        object: isExpectCall
      })
      .forEach(p => {
        switch (p.value.property.name) {
          case 'exist':
            p.value.property.name = 'toBeDefined';
            break;
          case 'equal':
            p.value.property.name = 'toEqual';
            break;
          case 'Throw':
            p.value.property.name = 'toThrow';
            break;
        }
      })
      .toSource();
};
