
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  let MochaMixVariable = 'MochaMix';
  const variables = {};
  const variablesToRemove = [];
  const imports = {};

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

  return body;
};

module.exports.parser = 'babylon';
