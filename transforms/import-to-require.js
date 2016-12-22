module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let mutations = 0;

  function objectProperty(vars) {
    return vars.map((key) => {
      const obj = j.objectProperty(key, key);
      obj.shorthand = true;
      return obj;
    });
  }

  function objectPattern(vars) {
    return j.objectPattern(objectProperty(vars));
  }

  function objectExpression(vars) {
    return j.objectExpression(objectProperty(vars));
  }

  function declare(id, init) {
    return j.variableDeclaration('const', [
      j.variableDeclarator(id, init)
    ]);
  }

  function createRequire(key, source) {
    let id = key;
    const s = typeof source === 'string' ? j.stringLiteral(source) : source;
    if (typeof key === 'string') {
      id = j.identifier(key);
    }

    return declare(id, j.callExpression(j.identifier('require'), [s]));
  }

  mutations += root.find(j.ImportDeclaration, {
    specifiers: [{
      type: j.ImportDefaultSpecifier.name
    }]
  })
    .replaceWith(p => createRequire(p.value.specifiers[0].local, p.value.source))
    .size();

  mutations += root.find(j.ImportDeclaration, {
    specifiers: [{
      type: j.ImportSpecifier.name
    }]
  })
    .replaceWith(p =>
      createRequire(objectPattern(p.value.specifiers.map(s => s.imported)), p.value.source))
    .size();

  const moduleExports = value =>
    j.expressionStatement(
      j.assignmentExpression('=',
        j.memberExpression(j.identifier('module'), j.identifier('exports')),
        value
      )
    );

  mutations += root.find(j.ExportDefaultDeclaration)
    .replaceWith(p => moduleExports(p.value.declaration))
    .size();

  mutations += root.find(j.ExportNamedDeclaration)
    .replaceWith(p => moduleExports(objectExpression(p.value.specifiers.map(s => s.local))))
    .size();

  return mutations ? root.toSource() : null;
};
