// not implemented property, ownProperty, respondTo
const fns = ['keys', 'a', 'an', 'instanceof', 'lengthOf'];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  const isExpectCall = node => (node.name === 'expect' ||
    (node.type === j.MemberExpression.name &&
      isExpectCall(node.object)) ||
    (node.type === j.CallExpression.name &&
      isExpectCall(node.callee)));

  function getExpectCall(node) {
    let curr = node;

    while ((curr.type === j.MemberExpression.name || curr.type === j.CallExpression.name &&
      curr.callee.name !== 'expect'
    )) {
      if (curr.type === j.MemberExpression.name) {
        curr = curr.object;
      } else if (curr.type === j.CallExpression.name) {
        curr = curr.callee;
      }
    }

    return curr;
  }

  function updateExpect(node, fn) {
    const args = node.arguments.map(fn);

    return j.callExpression(j.identifier('expect'), args);
  }

  function createCall(fn, args, rest, containsNot) {
    const expression = containsNot ? j.memberExpression(rest, j.identifier('not')) : rest;

    return j.memberExpression(
      expression,
      j.callExpression(
        j.identifier(fn),
        args
      ));
  }

  function chainContains(fn, value) {
    let curr = value;

    while (curr.type === j.MemberExpression.name
    && curr.property.name !== fn) {
      curr = curr.object;
    }

    return curr.type === j.MemberExpression.name && curr.property.name === fn;
  }

  return j(file.source)
    .find(j.CallExpression.name, {
      callee: {
        property: {
          name: name => fns.indexOf(name) !== -1
        },
        object: isExpectCall
      }
    })
    .replaceWith((p) => {
      const expectCall = getExpectCall(p.value);
      const containsNot = chainContains('not', p.value.callee);
      const args = p.value.arguments;
      // const containsAny = chainContains('any', p.value.callee);
      // const containsAll = chainContains('all', p.value.callee);


      switch (p.value.callee.property.name) {
        case 'keys':
          return createCall('toEqual', [
            j.callExpression(
              j.memberExpression(j.identifier('jasmine'), j.identifier('arrayContaining')),
              args
            )
          ], updateExpect(expectCall, node => j.callExpression(
            j.memberExpression(j.identifier('Object'), j.identifier('keys')),
            [node]
          )), containsNot);
        case 'a':
        case 'an':
          if (!args.length) {
            return p;
          }
          if (args[0].type === j.StringLiteral.name) {
            return createCall('toBe', args,
              updateExpect(expectCall, node => j.unaryExpression('typeof', node)), containsNot);
          }
          return createCall('toBe', [j.booleanLiteral(true)],
            updateExpect(expectCall, node => j.binaryExpression('instanceof', node, args[0])),
            containsNot
          );
        case 'instanceof':
          return createCall('toBe', [j.booleanLiteral(true)],
            updateExpect(expectCall, node => j.binaryExpression('instanceof', node, args[0])),
            containsNot
          );
        case 'lengthOf':
          return createCall('toBe', [],
            updateExpect(expectCall, node => j.memberExpression(node, j.identifier('length'))),
            containsNot
          );
        default:
          return p;
      }
    })
    .toSource();
};

module.exports.parser = 'babylon';
