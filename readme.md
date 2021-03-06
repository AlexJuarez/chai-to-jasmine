## chai-to-jasmine [![Build Status](https://travis-ci.org/AlexJuarez/chai-to-jasmine.svg?branch=master)](https://travis-ci.org/AlexJuarez/chai-to-jasmine)

This repository has been depreciated by a contribution to https://github.com/skovhus/jest-codemods. All future updates and bug fixes will live on in the jest-codemods repository.

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
keys, a, an, instanceof, lengthof, length, equal, throw,
include, contain, eql, above, least, below, most, match,
string, members, property, ownproperty, ownpropertydescriptor,
gte, lte
```
- members
```
ok, true, false, null, undefined, exist, empty, nan
```

## Unsupported Chai Assertions
```
oneOf, change, increase, decrease
```
## Quirks

#### `.keys`

`.any` is not currently supported, e.g. the following code will not correctly be converted
```javascript
expect([1, 3, 4]).to.have.any.keys(1, 2);
```

##### Example Input
```javascript
expect([1, 2, 3]).to.have.all.keys(1, 2);
expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys({'bar': 6});
```

##### Example Output
```javascript
expect([1, 2, 3]).toEqual(jasmine.arrayContaining([1, 2]));
expect(Object.keys({ foo: 1, bar: 2 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6, 'foo': 7})));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(['bar', 'foo']));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6})));
```

#### `.a|.an`

The converted form uses typeof to make the type checking, some of the chai types will not be correctly checked.

##### Example
Correctish output
```javascript
// Input
expect('test').to.be.a('string');
expect({ foo: 'bar' }).to.be.an('object');
expect(null).to.be.a('null');
expect(undefined).to.be.an('undefined');
// Correct Output
expect(typeof 'test').toBe('string');
expect(typeof { foo: 'bar' }).toBe('object');
expect(null).toBeNull();
expect(undefined).toBeUndefined();
// Input that may not work
expect(new Error).to.be.an('error');
expect(new Promise).to.be.a('promise');
expect(new Float32Array()).to.be.a('float32array');
expect(Symbol()).to.be.a('symbol');
// Output that may not work
expect(typeof new Error).toBe('error');
expect(typeof new Promise).toBe('promise');
expect(typeof new Float32Array()).toBe('float32array');
expect(typeof Symbol()).toBe('symbol');
```

#### `.property`

Does not support deeply nested property checks. The following code will not be correctly converted.
```javascript
expect(deepObj).to.have.deep.property('green.tea', 'matcha');
```
