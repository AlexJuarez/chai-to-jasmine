## chai-to-jasmine [![Build Status](https://travis-ci.org/AlexJuarez/chai-to-jasmine.svg?branch=master)](https://travis-ci.org/AlexJuarez/chai-to-jasmine)

A [jscodeshift](https://github.com/facebook/jscodeshift) codemod that transforms test files from [chai](http://chaijs.com/) to [Jasmine](https://jasmine.github.io/edge/introduction).

## Install & Run

```sh
npm install -g jscodeshift
git clone https://github.com/AlexJuarez/chai-to-jasmine.git
jscodeshift -t ./transforms/chai-to-jasmine <file>
```

## Supported Chai Assertions

- calls
```
keys, a, an, instanceof, lengthOf, equal, throw, include, contain, eql, above, least, below, most, match, string, members
```
- members
```
ok, true, false, null, undefined, exist, empty
```

## Unsupported Chai Assertions
```
within, oneOf, change, increase, decrease
```
## Quirks

#### `.keys`

`.any` is not currently supported, e.g. the following code will not correctly be converted
```javascript
expect([1, 3, 4]).to.have.any.keys(1, 2);
```

Input
```javascript
expect([1, 2, 3]).to.have.all.keys(1, 2);
expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys({'bar': 6});
```

Output
```javascript
expect([1, 2, 3]).toEqual(jasmine.arrayContaining([1, 2]));
expect(Object.keys({ foo: 1, bar: 2 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6, 'foo': 7})));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(['bar', 'foo']));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6})));
```

#### `.a|.an`

The converted form uses typeof to make the type checking, some of the chai types will not be correctly checked.

Input
```javascript
expect('test').to.be.a('string');
expect({ foo: 'bar' }).to.be.an('object');
expect(null).to.be.a('null');
expect(undefined).to.be.an('undefined');
expect(new Error).to.be.an('error');
expect(new Promise).to.be.a('promise');
expect(new Float32Array()).to.be.a('float32array');
expect(Symbol()).to.be.a('symbol');
```

Output
```javascript
expect(typeof 'test').toBe('string');
expect(typeof { foo: 'bar' }).toBe('object');
expect(typeof null).toBe('null');
expect(typeof undefined).toBe('undefined');
expect(typeof new Error).toBe('error');
expect(typeof new Promise).toBe('promise');
expect(typeof new Float32Array()).toBe('float32array');
expect(typeof Symbol()).toBe('symbol');
```

#### `.exist`

This assertion is converted to a simpler length check which may not
be the intention

Input
```javascript
expect(foo).to.exist;
expect(bar).to.not.exist;
expect(baz).to.not.exist;
```

Output
```javascript
expect(foo.length).toBeTruthy();
expect(bar.length).toBeFalsy();
expect(baz.length).toBeFalsy();
```

#### `.property`

Does not support deeply nested property checks
