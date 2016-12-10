const enzymeFns = [
  'find',
  'props',
  'childAt',
  'children',
  'setState',
  'mount',
  'unmount',
  'instance'
];

module.exports = (j, source) => {
  const components = {};

  let body = j(source)
    .find(j.AssignmentExpression, {
      right: {
        type: j.CallExpression.name,
        callee: {
          name: 'mount'
        }
      }
    })
    .forEach((p) => {
      components[p.value.left.name] = true;
    })
    .toSource();

  // check props
  body = j(body)
    .find(j.MemberExpression, {
      object: {
        name: name => components[name]
      },
      property: {
        type: j.Identifier.name,
        name: name => enzymeFns.indexOf(name) === -1
      }
    })
    .replaceWith(p => j.memberExpression(
      j.callExpression(
        j.memberExpression(p.value.object, j.identifier('instance')),
        []
      ),
      p.value.property
    ))
    .toSource();

  // check function calls
  return j(body)
    .find(j.CallExpression, {
      callee: {
        object: {
          name: name => components[name]
        },
        property: {
          name: name => enzymeFns.indexOf(name) === -1
        }
      }
    })
    .forEach((p) => {
      p.value.callee.object = j.callExpression(j.memberExpression(
        p.value.callee.object,
        j.identifier('instance')
      ), []);
    })
    .toSource();
};
