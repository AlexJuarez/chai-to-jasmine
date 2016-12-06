/**
 * Mapping most of the sinon calls to jasmine equivalent calls.
 * check https://github.com/domenic/sinon-chai for more info.
 * @type {[*]}
 */
const properties = ['called', 'calledOnce', 'calledTwice', 'calledThrice'];
const fns = ['callCount', 'calledWith', 'calledWithExactly', 'calledWithMatch'];
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

  function createCall(fn, args, rest) {
    return j.memberExpression(
      rest,
      j.callExpression(
        j.identifier(fn),
        args
      ));
  }

  function getAllBefore(memberName, value) {
    let rest = value;
    const equalsMemberName = (typeof memberName === 'function') ? memberName : (name => name === memberName);
    while(rest.type === j.MemberExpression.name && !equalsMemberName(rest.property.name)) {
      rest = rest.object;
    }

    if (equalsMemberName(rest.property.name)) {
      rest = rest.object;
    }
    return rest;
  }

  function addMatcher(node) {
    switch(node.type) {
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

  let body = j(file.source)
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
    .replaceWith(p => {
      if (p.value.arguments.length === 0) {
        return j.callExpression(
          j.memberExpression(
            j.identifier('jasmine'), j.identifier('createSpy')
          ),
          []
        );
      }
      return p;
    }).toSource();

  body = j(body)
    .find(j.MemberExpression, {
      property: {
        name: name => properties.indexOf(name) !== -1
      },
      object: {
        type: j.MemberExpression.name
      }
    }).replaceWith(p => {
      const rest = getAllBefore('have', p.value);

      switch(p.value.property.name) {
        case 'called':
          return createCall('toHaveBeenCalled', [], rest);
        case 'calledOnce':
          return createCall('toHaveBeenCalledTimes', [j.numericLiteral(1)], rest);
        case 'calledTwice':
          return createCall('toHaveBeenCalledTimes', [j.numericLiteral(2)], rest);
        case 'calledThrice':
          return createCall('toHaveBeenCalledTimes', [j.numericLiteral(3)], rest);
      }

      return p;
    }).toSource();

  return j(body)
    .find(j.CallExpression, {
      callee: {
        type: j.MemberExpression.name,
        property: {
          name: name => fns.indexOf(name) !== -1
        }
      }
    })
    .replaceWith(p => {
      const rest = getAllBefore(name => ['have', 'always'].indexOf(name) !== -1, p.value.callee);

      switch(p.value.callee.property.name) {
        case 'callCount':
          return createCall('toHaveBeenCalledTimes', p.value.arguments, rest);
        case 'calledWith':
          return createCall('toHaveBeenCalledWith', p.value.arguments, rest);
        case 'calledWithExactly':
          return createCall('toHaveBeenCalledWith', p.value.arguments, rest);
        case 'calledWithMatch':
          return createCall('toHaveBeenCalledWith', p.value.arguments.map(addMatcher), rest);
      }

      return p;
    }).toSource();
};

module.exports.parser = 'babylon';
