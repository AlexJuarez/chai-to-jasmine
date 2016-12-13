const util = require('./../util');

module.exports = (j, root) => {
  const createCallChain = util.createCallChain(j);

  root.find(j.MemberExpression, {
    object: {
      object: {
        property: {
          name: 'props'
        }
      },
      property: {
        name: 'children'
      }
    },
    property: {
      type: j.NumericLiteral.name
    }
  })
  .replaceWith(p => j.callExpression(
    j.memberExpression(p.value.object.object.object, j.identifier('childAt')),
    [p.value.property]
  ));

  root.find(j.MemberExpression, {
    object: {
      property: {
        name: 'props'
      }
    },
    property: {
      name: 'children'
    }
  })
  .replaceWith(p => j.callExpression(
    j.memberExpression(p.value.object.object, j.identifier('children')),
    []
  ));

  root.find(j.MemberExpression, {
    object: {
      property: {
        name: name => name === 'props' || name === 'state'
      }
    }
  })
  .replaceWith(p => {
    switch (p.value.object.property.name) {
      case 'props':
        return j.callExpression(
          j.memberExpression(p.value.object.object, j.identifier('prop')),
          [p.value.computed ? p.value.property : j.stringLiteral(p.value.property.name)]
        );
      case 'state':
        return j.callExpression(
          j.memberExpression(p.value.object.object, j.identifier('state')),
          [p.value.computed ? p.value.property : j.stringLiteral(p.value.property.name)]
        );
      default:
        return p.value;
    }

  });

  root.find(j.MemberExpression, {
    property: {
      name: 'props'
    }
  }).replaceWith(p => j.memberExpression(p.value.object,
    j.callExpression(p.value.property, [])));

  root.find(j.CallExpression, {
    callee: {
      property: {
        name: 'prop'
      }
    },
    arguments: [{
      type: j.StringLiteral.name,
      value: 'content'
    }]
  }).replaceWith(p => createCallChain(['mount'], [p.value]));

  root.find(j.MemberExpression, {
    property: {
      name: 'children'
    }
  }).filter(p => p.parent.value.type !== j.CallExpression.name)
    .replaceWith(p => createCallChain([p.value.object, p.value.property], []));
};
