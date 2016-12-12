module.exports = (j, root) => {
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
        name: 'props'
      }
    }
  })
  .replaceWith(p => j.callExpression(
    j.memberExpression(p.value.object.object, j.identifier('prop')),
    [p.value.computed ? p.value.property : j.stringLiteral(p.value.property.name)]
  ));
};
