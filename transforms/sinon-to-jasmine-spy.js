/**
 * Mapping most of the sinon calls to jasmine equivalent calls.
 * check https://github.com/domenic/sinon-chai for more info.
 * @type {[*]}
 */
const util = require('./util');

const properties = ['called', 'calledOnce', 'calledTwice', 'calledThrice'];
const fns = ['callCount', 'calledWith', 'calledWithExactly', 'calledWithMatch'];
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const createCall = util.createCall(j);
  const chainContains = util.chainContains(j);
  const getAllBefore = util.getNodeBeforeMemberExpression(j);
  const createCallChain = util.createCallChain(j);

  function addMatcher(node) {
    switch (node.type) {
      case j.RegExpLiteral.name:
      case j.StringLiteral.name:
        return createCallChain(['jasmine', 'stringMatching'], [node]);
      case j.ObjectExpression.name:
        return createCallChain(['jasmine', 'objectContaining'], [node]);
      default:
        return node;
    }
  }

  root.find(j.CallExpression, {
    callee: {
      type: j.MemberExpression.name,
      object: {
        type: j.Identifier.name,
        name: 'sinon'
      }
    }
  })
  .replaceWith((p) => {
    switch (p.value.callee.property.name) {
      case 'spy': {
        if (p.value.arguments.length === 0) {
          return createCallChain(['jasmine', 'createSpy'], []);
        } else if (p.value.arguments.length === 2) {
          return createCallChain(['spyOn'], p.value.arguments);
        }
        return p.node;
      }
      case 'stub':
        return createCallChain(['spyOn'], p.value.arguments);
      case 'match':
        return p.value.arguments;
      case 'useFakeTimers':
        j(p).closest(j.ExpressionStatement)
          .forEach((p1) => {
            p1.prune();
          });
        return null;
      default:
        console.warn(`sinon.${p.value.callee.property.name} is unhandled`);
        return p.node;
    }
  });

  const updateWithArgs = (rest, path) => {
    j(rest)
      .find(j.CallExpression, {
        callee: {
          property: {
            name: 'withArgs'
          }
        }
      })
      .replaceWith((p1) => {
        j(path)
          .closest(j.ExpressionStatement)
          .insertBefore(j.expressionStatement(
            createCall('toHaveBeenCalledWith', p1.value.arguments, rest)
          ));

        return p1.value.callee.object;
      });
  };

  root
  .find(j.MemberExpression, {
    property: {
      name: name => properties.indexOf(name) !== -1
    },
    object: {
      type: j.MemberExpression.name
    }
  }).replaceWith((p) => {
    let rest = getAllBefore('have', p.value);
    const containsNot = chainContains('not', p.value, 'have');
    if (chainContains('to', rest)) {
      rest = getAllBefore('to', p.value);
    }

    updateWithArgs(rest, p);

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
    let rest = getAllBefore(haveOrAlways, p.value.callee);
    const containsNot = chainContains('not', p.value, haveOrAlways);
    if (chainContains('to', rest)) {
      rest = getAllBefore('to', p.value);
    }

    updateWithArgs(rest, p);

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
