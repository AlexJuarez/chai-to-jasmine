const rmReactUtils = require('./helpers/rm-react-utils');
const convertProps = require('./helpers/convert-props-for-enzyme');
const wrapInteralCalls = require('./helpers/wrap-internal-calls-for-enzyme');
const util = require('./util');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let MochaMixVariable = 'MochaMix';
  const variables = {};
  const imports = {};

  const createCallChain = util.createCallChain(j);

  // locate and remove 'mocha-mix' import
  root.find(j.ImportDeclaration, {
    source: {
      value: 'mocha-mix'
    }
  })
  .forEach((p) => {
    MochaMixVariable = p.value.specifiers[0].local.name;
    p.prune();
  });

  /**
   * find components defined by MochaMix.mix
   * save the component name and import definition
   */
  root.find(j.VariableDeclaration, {
    declarations: [{
      type: j.VariableDeclarator.name,
      init: {
        type: j.CallExpression.name,
        callee: {
          type: j.MemberExpression.name,
          object: {
            name: name => name === MochaMixVariable
          }
        }
      }
    }]
  })
  .forEach((p) => {
    variables[p.value.declarations[0].id.name] = p.value.declarations[0]
      .init.arguments[0].properties[1].value.value;
    j(p.node)
      .find(j.ObjectProperty, {
        key: {
          type: j.Identifier.name,
          name: 'mocks'
        },
        value: {
          type: j.ObjectExpression.name
        }
      })
      .forEach((p1) => {
        p1.value.value.properties
          .filter(p => p.type === j.ObjectProperty.name)
          .forEach((prop) => {
            if (prop.value.type === j.StringLiteral.name) {
              imports[prop.key.name] = prop.value.value;
            } else {
              j(prop)
                .find(j.ObjectProperty, {
                  key: {
                    name: 'import'
                  }
                })
                .forEach((p2) => {
                  imports[prop.key.name] = p2.value.value.value;
                });
            }
          });
      });
    p.prune();
  });

  // find component variable name by looking for mix.import
  root.find(j.ExpressionStatement, {
    expression: {
      type: j.AssignmentExpression.name,
      right: {
        type: j.CallExpression.name,
        callee: {
          type: j.MemberExpression.name,
          object: {
            name: name => variables[name] != null
          }
        }
      }
    }
  })
  .forEach((p) => {
    imports[p.value.expression.left.name]
      = variables[p.value.expression.right.callee.object.name];
    p.prune();
  });

  // replace renderIntoDocument calls with mount
  root.find(j.CallExpression, {
    callee: {
      name: 'renderIntoDocument'
    }
  })
  .forEach((p) => {
    j(p).closest(j.AssignmentExpression).forEach((p1) => {
      root.find(j.CallExpression, {
        callee: {
          name: 'spyOn'
        },
        arguments: [{
          name: name => name === p1.value.left.name
        }]
      }).forEach((p2) => {
        p2.value.arguments[0] = createCallChain([p2.value.arguments[0], 'instance'], []);
      });
    });
    p.value.callee.name = 'mount';
  });

  // replace findRenderedComponentWithType
  const findExpressions = ['scryRenderedComponentsWithType', 'findRenderedComponentWithType',
    'isCompositeComponentElementWithType', 'scryRenderedDOMComponentsWithType',
    'findRenderedComponentWithType', 'elementQuerySelectorAll'];

  root.find(j.CallExpression, {
    callee: {
      name: name => findExpressions.indexOf(name) !== -1
    }
  }).replaceWith(p =>
    createCallChain([p.value.arguments[0], 'find'], [p.value.arguments[1]]));

  root.find(j.VariableDeclarator, {
    init: {
      callee: {
        property: {
          name: 'find'
        }
      }
    }
  }).forEach((p) => {
    root.find(j.MemberExpression, {
      object: {
        name: name => name === p.value.id.name
      },
      property: {
        type: j.NumericLiteral.name
      }
    }).replaceWith(p1 => createCallChain([p1.value.object, 'at'], [p1.value.property]));
  });

  root.find(j.CallExpression, {
    callee: {
      name: 'elementQuerySelector'
    }
  }).replaceWith(p => createCallChain([
    createCallChain([p.value.arguments[0], 'find'], [p.value.arguments[1]]), 'first'], []));

  const createArgs = (node, args) => {
    if (node.value.property.name === 'getAttribute') {
      return node.parent.value.arguments;
    }

    return [j.stringLiteral(node.value.property.name)];
  };

  root.find(j.CallExpression, {
    callee: {
      name: 'findDOMNode'
    }
  }).replaceWith((p) => {
    // find call instances and update them to .children().first().attr('...')
    j(p).closest(j.VariableDeclarator)
      .forEach((p1) => {
        j(p1).closestScope().find(j.MemberExpression, {
          property: {
            type: j.Identifier.name
          },
          object: {
            name: name => name === p1.value.id.name
          }
        }).forEach(p2 => {
          const node = createCallChain([
            createCallChain([
              createCallChain([
                p2.value.object,
                'children'
              ], []),
              'first'], []),
            'attr'
          ], createArgs(p2));

          if (p2.parent.value.type === j.CallExpression.name &&
            p2.value.property.name === 'getAttribute') {
            p2.parent.replace(node);
          } else {
            p2.replace(node);
          }
        });
      });

    return createCallChain([p.value.arguments[0], 'render'], []);
  });

  root.find(j.CallExpression, {
    callee: {
      name: name => name === 'simulateEvent' || name === 'simulateNativeEvent'
    }
  }).replaceWith(p =>j.callExpression(
    j.memberExpression(p.value.arguments[0], j.identifier('simulate')),
    p.value.arguments.splice(1)
  ));

  // replace refs
  root.find(j.MemberExpression, {
    object: {
      type: j.MemberExpression.name,
      property: {
        type: j.Identifier.name,
        name: 'refs'
      }
    }
  }).replaceWith(p => j.callExpression(
    j.memberExpression(p.value.object.object, j.identifier('ref')),
    [j.stringLiteral(p.value.property.name)]
  ));

  // remove before statement with require loading components.
  root.find(j.ExpressionStatement, {
    expression: {
      callee: {
        name: 'before'
      },
      arguments: [{
        type: j.ArrowFunctionExpression.name,
        body: {
          type: j.BlockStatement.name
        }
      }]
    }
  })
  .forEach((p) => {
    j(p).find(j.BlockStatement)
      .forEach((blockPath) => {
        j(blockPath).find(j.AssignmentExpression, {
          right: {
            callee: {
              name: 'require'
            }
          }
        }).forEach((requirePath) => {
          const name = requirePath.value.left.name;
          imports[name] = requirePath.value.right.arguments[0].value;
        });
      });

    p.prune();
  });

  root.find(j.MemberExpression, {
    object: {
      object: {
        name: 'mix'
      },
      property: {
        name: 'mocks'
      }
    }
  }).replaceWith(p => p.value.property);

  root.find(j.CallExpression, {
    callee: {
      property: {
        name: 'getAttribute'
      }
    }
  }).replaceWith(p => createCallChain([
    createCallChain([p.value.callee.object, 'render'], []),
    'attr'
  ], p.value.arguments));

  root.find(j.MemberExpression, {
    property: {
      name: 'textContent'
    }
  }).replaceWith(p =>
    j.callExpression(j.memberExpression(p.value.object, j.identifier('text')), []));

  // remove variableDeclarations for components
  root.find(j.VariableDeclaration, {
    declarations: [{
      id: {
        name: name => Object.keys(imports).indexOf(name) !== -1
      }
    }]
  })
  .remove();

  root.find(j.StringLiteral, {
    value: value => value.indexOf('data-component')
  })
  .forEach((p) => {
    if (p.value.value.indexOf('=') !== -1) {
      p.value.value = p.value.value.replace('=', '="').replace(']', '"]');
    }
  });

  // remove old imports
  rmReactUtils(j, root);

  function createSpecificImport(members, source) {
    return j.importDeclaration(
      members.map(m => j.importSpecifier(j.identifier(m))),
      j.stringLiteral(source)
    );
  }

  function createDefaultImport(name, source) {
    return j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier(name))],
      j.stringLiteral(source)
    );
  }

  // create imports and add TestMode for radium
  root.find(j.ImportDeclaration)
    .at(-1)
    .insertAfter(() => {
      const statements = [];
      statements.push(createSpecificImport(['mount'], 'enzyme'));

      Object.keys(imports).filter(k => imports[k]).forEach((key) => {
        statements.push(createDefaultImport(key, imports[key]));
      });

      return statements;
    });

  convertProps(j, root);
  wrapInteralCalls(j, root);

  return root.toSource({ quote: 'single' });
};

module.exports.parser = 'babylon';
