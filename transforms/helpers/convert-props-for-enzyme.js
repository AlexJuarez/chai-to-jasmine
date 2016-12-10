module.exports = (j, source) => {
  let body = j(source)
    .find(j.MemberExpression, {
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
    ))
    .toSource({ quote: 'single' });

  body = j(body)
    .find(j.MemberExpression, {
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
    ))
    .toSource({ quote: 'single' });

  return j(body)
    .find(j.MemberExpression, {
      object: {
        property: {
          name: 'props'
        }
      }
    })
    .replaceWith(p => j.callExpression(
      j.memberExpression(p.value.object.object, j.identifier('prop')),
      [p.value.computed ? p.value.property : j.stringLiteral(p.value.property.name)]
    ))
    .toSource({ quote: 'single' });
};
