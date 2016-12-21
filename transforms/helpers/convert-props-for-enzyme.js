const util = require('./../util');

module.exports = (j, root) => {
  const createCallChain = util.createCallChain(j);
  let mutations = 0;

  mutations += root.find(j.MemberExpression, {
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
  )).size();

  mutations += root.find(j.MemberExpression, {
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
  )).size();

  mutations += root.find(j.MemberExpression, {
    object: {
      property: {
        name: name => name === 'props' || name === 'state'
      }
    }
  })
  .replaceWith((p) => {
    const arg = p.value.computed ? p.value.property : j.stringLiteral(p.value.property.name);
    let size = 0;
    switch (p.value.object.property.name) {
      case 'props':
        return createCallChain([p.value.object.object, 'prop'], [arg]);
      case 'state':
        // for the case foo.state.bar = foobar;
        size = j(p).closest(j.AssignmentExpression).replaceWith(p1 =>
          createCallChain([p.value.object.object, 'setState'], [
            j.objectExpression([j.objectProperty(arg, p1.value.right)])
          ])
        ).size();
        return size ? p.value : createCallChain([p.value.object.object, 'state'], [arg]);
      default:
        return p.value;
    }
  }).size();

  mutations += root.find(j.MemberExpression, {
    property: {
      name: 'props'
    }
  }).replaceWith(p =>
    j.memberExpression(p.value.object, j.callExpression(p.value.property, []))
  ).size();

  mutations += root.find(j.CallExpression, {
    callee: {
      property: {
        name: 'prop'
      }
    },
    arguments: [{
      type: j.StringLiteral.name,
      value: 'content'
    }]
  }).replaceWith(p => createCallChain(['mount'], [p.value]))
    .size();

  mutations += root.find(j.MemberExpression, {
    property: {
      name: 'children'
    }
  }).filter(p => p.parent.value.type !== j.CallExpression.name &&
    p.parent.value.type !== j.AssignmentExpression.name
  ).replaceWith(p => createCallChain([p.value.object, p.value.property], []))
    .size();

  function placeAtCalls(p, nodeName) {
    const scope = j(p).closestScope();
    mutations += scope.find(j.MemberExpression, {
      object: {
        name: name => name === nodeName
      },
      property: {
        type: j.NumericLiteral.name
      }
    }).replaceWith(p1 => createCallChain([p1.value.object, 'at'], [p1.value.property]))
      .size();

    mutations += scope.find(j.Identifier, {
      name: name => name === nodeName
    }).forEach((p1) => {
      j(p1).closest(j.ExpressionStatement).forEach((p2) => {
        j(p2).find(j.MemberExpression, {
          property: {
            name: 'style'
          }
        }).replaceWith(p3 =>
          createCallChain([p3.value.object, 'prop'], [j.stringLiteral('style')]));
      });
    }).size();
  }

  mutations += root.find(j.CallExpression, {
    callee: {
      property: {
        name: 'find'
      }
    }
  }).forEach((p) => {
    const select = j(p);
    select.closest(j.VariableDeclarator).forEach((p1) => {
      placeAtCalls(p1, p1.value.id.name);
    });

    select.closest(j.AssignmentExpression).forEach((p1) => {
      placeAtCalls(p1, p1.value.left.name);
    });
  }).size();

  return mutations;
};
