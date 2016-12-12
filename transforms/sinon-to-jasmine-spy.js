/**
 * Mapping most of the sinon calls to jasmine equivalent calls.
 * check https://github.com/domenic/sinon-chai for more info.
 * @type {[*]}
 */
const properties = ['called', 'calledOnce', 'calledTwice', 'calledThrice'];
const fns = ['callCount', 'calledWith', 'calledWithExactly', 'calledWithMatch'];
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function createCall(fn, args, rest, containsNot) {
    const expression = containsNot ? j.memberExpression(rest, j.identifier('not')) : rest;

    return j.memberExpression(
      expression,
      j.callExpression(
        j.identifier(fn),
        args
      ));
  }

  function chainContains(fn, value, end) {
    let curr = value;
    const checkEnd = (typeof end === 'function') ? end : name => name === end;

    while (curr.type === j.MemberExpression.name
    && curr.property.name !== fn
    && !checkEnd(curr.property.name)) {
      curr = curr.object;
    }

    return curr.type === j.MemberExpression.name && curr.property.name === fn;
  }

  function getAllBefore(memberName, value) {
    let rest = value;
    const equalsMemberName = (typeof memberName === 'function') ? memberName : (name => name === memberName);
    while (rest.type === j.MemberExpression.name && !equalsMemberName(rest.property.name)) {
      rest = rest.object;
    }

    if (equalsMemberName(rest.property.name)) {
      rest = rest.object;
    }
    return rest;
  }

  function addMatcher(node) {
    switch (node.type) {
      case j.RegExpLiteral.name:
      case j.StringLiteral.name:
        return j.callExpression(
          j.memberExpression(
            j.identifier('jasmine'),
            j.identifier('stringMatching')
          ),
          [node]
        );
      case j.ObjectExpression.name:
        return j.callExpression(
          j.memberExpression(
            j.identifier('jasmine'),
            j.identifier('objectContaining')
          ),
          [node]
        );
      default:
        return node;
    }
  }

  root
  .find(j.CallExpression, {
    callee: {
      type: j.MemberExpression.name,
      object: {
        name: 'sinon'
      },
      property: {
        name: 'spy'
      }
    }
  })
  .replaceWith((p) => {
    if (p.value.arguments.length === 0) {
      return j.callExpression(
        j.memberExpression(
          j.identifier('jasmine'), j.identifier('createSpy')
        ),
        []
      );
    }
    return p;
  });

  root
  .find(j.MemberExpression, {
    property: {
      name: name => properties.indexOf(name) !== -1
    },
    object: {
      type: j.MemberExpression.name
    }
  }).replaceWith((p) => {
    const rest = getAllBefore('have', p.value);
    const containsNot = chainContains('not', p.value, 'have');

    switch (p.value.property.name) {
      case 'called':
        return createCall('toHaveBeenCalled', [], rest, containsNot);
      case 'calledOnce':
        return createCall('toHaveBeenCalledTimes', [j.numericLiteral(1)], rest, containsNot);
      case 'calledTwice':
        return createCall('toHaveBeenCalledTimes', [j.numericLiteral(2)], rest, containsNot);
      case 'calledThrice':
        return createCall('toHaveBeenCalledTimes', [j.numericLiteral(3)], rest, containsNot);
      default:
        return p;
    }
  });

  root
  .find(j.CallExpression, {
    callee: {
      type: j.MemberExpression.name,
      property: {
        name: name => fns.indexOf(name) !== -1
      }
    }
  })
  .replaceWith((p) => {
    const haveOrAlways = name => ['have', 'always'].indexOf(name) !== -1;
    const rest = getAllBefore(haveOrAlways, p.value.callee);
    const containsNot = chainContains('not', p.value, haveOrAlways);

    switch (p.value.callee.property.name) {
      case 'callCount':
        return createCall('toHaveBeenCalledTimes', p.value.arguments, rest, containsNot);
      case 'calledWith':
        return createCall('toHaveBeenCalledWith', p.value.arguments, rest, containsNot);
      case 'calledWithExactly':
        return createCall('toHaveBeenCalledWith', p.value.arguments, rest, containsNot);
      case 'calledWithMatch':
        return createCall('toHaveBeenCalledWith',
          p.value.arguments.map(addMatcher), rest, containsNot);
      default:
        return p;
    }
  });

  return root.toSource();
};

module.exports.parser = 'babylon';
