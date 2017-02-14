module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let mutations = 0;

  root.find(j.VariableDeclaration, { kind: 'let' })
    .forEach((p) => {
      const scope = j(p).closestScope();
      const isConst = scope.find(j.AssignmentExpression, {
        left: left => p.value.declarations.some(dec => dec.id.name === left.name)
      })
      .size() === 0;

      const containsUpdate = scope.find(j.UpdateExpression, {
        argument: {
          name: name => p.value.declarations.some(dec => dec.id.name === name)
        }
      })
        .size() !== 0;

      if (isConst && !containsUpdate) {
        p.value.kind = 'const';
        mutations++;
      }
    });

  return mutations ? root.toSource() : null;
};
