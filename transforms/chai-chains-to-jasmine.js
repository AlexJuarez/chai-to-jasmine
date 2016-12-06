// not implemented ownPropertyDescriptor

// keys, a, an, instanceof, property, ownProperty, lengthOf, respondTo
// - expect modifications, within, oneOf, change, increase, decrease - statement modification

const fns = ['equal', 'throw', 'include',
  'contain', 'eql', 'above', 'least', 'below', 'most', 'match', 'string',
  'members'];

// empty

const members = ['ok', 'true', 'false', 'null', 'undefined', 'exist'];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;

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

  function getAllBefore(memberName, value, end) {
    let rest = value;
    const equalsMemberName = (typeof memberName === 'function') ? memberName : (name => name === memberName);
    const equalsEnd = (typeof end === 'function') ? end : name => name === end;
    while (rest.type === j.MemberExpression.name
      && !equalsMemberName(rest.property.name)
      && !equalsEnd(rest.property.name)) {
      rest = rest.object;
    }

    if (rest.type === j.MemberExpression.name
      && equalsMemberName(rest.property.name)
      && !equalsEnd(rest.property.name)) {
      rest = rest.object;
    }
    return rest;
  }

  function containing(node) {
    switch (node.type) {
      case j.ArrayExpression.name:
        return j.callExpression(
          j.memberExpression(j.identifier('jasmine'), j.identifier('arrayContaining')),
          [node]
        );
      case j.ObjectExpression.name:
        return j.callExpression(
          j.memberExpression(j.identifier('jasmine'), j.identifier('objectContaining')),
          [node]
        );
      default:
        return node;
    }
  }

  const body = j(file.source)
    .find(j.MemberExpression, {
      property: {
        name: name => members.indexOf(name) !== -1
      },
      object: {
        type: j.MemberExpression.name
      }
    }).replaceWith((p) => {
      const rest = getAllBefore('to', p.value);
      const containsNot = chainContains('not', p.value, 'to');

      switch (p.value.property.name) {
        case 'ok':
          return createCall('toBeTruthy', [], rest, containsNot);
        case 'true':
          return createCall('toEqual', [j.booleanLiteral(true)], rest, containsNot);
        case 'false':
          return createCall('toEqual', [j.booleanLiteral(false)], rest, containsNot);
        case 'null':
          return createCall('toBeNull', [], rest, containsNot);
        case 'undefined':
          return createCall('toBeUndefined', [], rest, containsNot);
        case 'exist':
          return createCall('toEqual', [j.callExpression(
            j.memberExpression(
              j.identifier('jasmine'),
              j.identifier('anything')
            ),
            []
          )], rest, containsNot);
        default:
          return p;
      }
    })
    .toSource();

  return j(body)
    .find(j.CallExpression, {
      callee: {
        type: j.MemberExpression.name,
        property: {
          name: name => fns.indexOf(name) !== -1
        }
      }
    })
    .replaceWith((p) => {
      const isPrefix = (name => (['to', 'with', 'that'].indexOf(name) !== -1));
      const rest = getAllBefore(isPrefix, p.value.callee, 'should');
      const containsNot = chainContains('not', p.value.callee, isPrefix);
      const containsDeep = chainContains('deep', p.value.callee, isPrefix);

      switch (p.value.callee.property.name) {
        case 'equal':
          return containsDeep ? createCall('toEqual', p.value.arguments, rest, containsNot) :
            createCall('toBe', p.value.arguments, rest, containsNot);
        case 'throw':
          return createCall('toThrowError', p.value.arguments, rest, containsNot);
        case 'include':
        case 'string':
        case 'contain':
          return createCall('toContain', p.value.arguments, rest, containsNot);
        case 'eql':
          return createCall('toEqual', p.value.arguments, rest, containsNot);
        case 'above':
          return createCall('toBeGreaterThan', p.value.arguments, rest, containsNot);
        case 'least':
          return createCall('toBeGreaterThanOrEqual', p.value.arguments, rest, containsNot);
        case 'below':
          return createCall('toBeLessThan', p.value.arguments, rest, containsNot);
        case 'most':
          return createCall('toBeLessThanOrEqual', p.value.arguments, rest, containsNot);
        case 'match':
          return createCall('toMatch', p.value.arguments, rest, containsNot);
        case 'members':
          return createCall('toEqual', p.value.arguments.map(containing), rest, containsNot);
        default:
          return p;
      }
    })
    .toSource();
};

module.exports.parser = 'babylon';
