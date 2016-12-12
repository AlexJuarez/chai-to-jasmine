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

module.exports = (j, root) => {
  const components = {};

  root.find(j.AssignmentExpression, {
    right: {
      type: j.CallExpression.name,
      callee: {
        name: 'mount'
      }
    }
  })
  .forEach((p) => {
    components[p.value.left.name] = true;
  });

  // check props
  root.find(j.MemberExpression, {
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
  ));

  // check function calls
  root.find(j.CallExpression, {
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
  });
};
