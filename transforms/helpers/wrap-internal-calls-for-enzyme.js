const enzymeFns = [
  'find',
  'props',
  'childAt',
  'children',
  'setState',
  'mount',
  'unmount',
  'instance',
  'state',
  'prop',
  'ref',
  'refs',
  'render'
];

module.exports = (j, root) => {
  const components = {};
  let mutations = 0;

  mutations += root
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
    .size();

  // check props
  mutations += root
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
    .size();

  // check function calls
  mutations += root
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
    .size();

  return mutations;
};
