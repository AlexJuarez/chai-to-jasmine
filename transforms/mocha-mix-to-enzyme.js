const rmReactUtils = require('./helpers/rm-react-utils');
const convertProps = require('./helpers/convert-props-for-enzyme');
const wrapInteralCalls = require('./helpers/wrap-internal-calls-for-enzyme');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let MochaMixVariable = 'MochaMix';
  const variables = {};
  const variablesToRemove = [];
  const imports = {};

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
        j(p1.node)
          .find(j.ObjectProperty)
          .forEach((p2) => {
            imports[p2.value.key.name] = p2.value.value.value;
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
    variablesToRemove.push(p.value.expression.left.name);
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
    p.value.callee.name = 'mount';
  });

  // replace findRenderedComponentWithType
  root.find(j.CallExpression, {
    callee: {
      name: 'findRenderedComponentWithType'
    }
  }).replaceWith(p => j.callExpression(
    j.memberExpression(p.value.arguments[0], j.identifier('find')),
    [p.value.arguments[1]]
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
    j.memberExpression(p.value.object.object, j.identifier('find')),
    [p.value.property]
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
    p.value.expression.arguments.forEach((arrFn) => {
      arrFn.body.body.forEach((statement) => {
        const name = statement.expression.left.name;
        variablesToRemove.push(name);
        imports[name] = statement.expression.right.arguments[0].value;
      });
    });

    p.prune();
  });

  // remove variableDeclarations for components
  root.find(j.VariableDeclaration, {
    declarations: [{
      id: {
        name: name => variablesToRemove.indexOf(name) !== -1
      }
    }]
  })
  .remove();

  root.find(j.StringLiteral, {
    value: value => value.indexOf('data-component')
  })
  .forEach((p) => {
    p.value.value = p.value.value.replace('=', '="').replace(']', '"]');
  });

  // replace findRenderedComponentWithType
  root.find(j.CallExpression, {
    callee: {
      name: name => name === 'findRenderedComponentWithType' || name === 'elementQuerySelector'
    }
  })
  .replaceWith(p => j.callExpression(
    j.memberExpression(p.value.arguments[0], j.identifier('find')),
    [p.value.arguments[1]]
  ));

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

      Object.keys(imports).forEach((key) => {
        statements.push(createDefaultImport(key, imports[key]));
      });

      return statements;
    });

  convertProps(j, root);
  wrapInteralCalls(j, root);

  return root.toSource({ quote: 'single' });
};

module.exports.parser = 'babylon';
