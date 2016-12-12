const rmReactUtils = require('./helpers/rm-react-utils');
const convertProps = require('./helpers/convert-props-for-enzyme');
const wrapInteralCalls = require('./helpers/wrap-internal-calls-for-enzyme');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  let MochaMixVariable = 'MochaMix';
  const variables = {};
  const variablesToRemove = [];
  const imports = {};

  // locate and remove 'mocha-mix' import
  let body = j(file.source)
    .find(j.ImportDeclaration, {
      source: {
        value: 'mocha-mix'
      }
    })
    .forEach((p) => {
      MochaMixVariable = p.value.specifiers[0].local.name;
      p.prune();
    })
    .toSource();

  /**
   * find components defined by MochaMix.mix
   * save the component name and import definition
   */
  body = j(body)
    .find(j.VariableDeclaration, {
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
      p.prune();
    })
    .toSource();

  // find component variable name by looking for mix.import
  body = j(body)
    .find(j.ExpressionStatement, {
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
    })
    .toSource();

  // replace renderIntoDocument calls with mount
  body = j(body)
    .find(j.CallExpression, {
      callee: {
        name: 'renderIntoDocument'
      }
    })
    .forEach((p) => {
      p.value.callee.name = 'mount';
    })
    .toSource();

  // remove before statement with require loading components.
  body = j(body)
    .find(j.ExpressionStatement, {
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
    })
    .toSource();

  // remove variableDeclarations for components
  body = j(body)
    .find(j.VariableDeclaration, {
      declarations: [{
        id: {
          name: name => variablesToRemove.indexOf(name) !== -1
        }
      }]
    })
    .remove()
    .toSource();

  body = j(body)
    .find(j.StringLiteral, {
      value: value => value.indexOf('data-component')
    })
    .forEach((p) => {
      p.value.value = p.value.value.replace('=', '="').replace(']', '"]');
    })
    .toSource({ quote: 'single' });

  // replace findRenderedComponentWithType
  body = j(body)
    .find(j.CallExpression, {
      callee: {
        name: name => name === 'findRenderedComponentWithType' || name === 'elementQuerySelector'
      }
    })
    .replaceWith(p => j.callExpression(
      j.memberExpression(p.value.arguments[0], j.identifier('find')),
      [p.value.arguments[1]]
    ))
    .toSource();

  // remove old imports
  body = rmReactUtils(j, body);

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
  body = j(body)
    .find(j.Program)
    .forEach((p) => {
      const statements = [];
      statements.push(createSpecificImport(['mount'], 'enzyme'));
      // statements.push(createSpecificImport(['TestMode'], 'radium'));

      Object.keys(imports).forEach((key) => {
        statements.push(createDefaultImport(key, imports[key]));
      });

      /* statements.push(
        j.expressionStatement(
          j.callExpression(
            j.memberExpression(j.identifier('TestMode'), j.identifier('enable')),
            []
          )
        )
      ); */

      p.value.body = statements.concat(p.value.body);
    })
    .toSource({ quote: 'single' });

  body = convertProps(j, body);
  body = wrapInteralCalls(j, body);

  return body;
};

module.exports.parser = 'babylon';
