// keys
expect(Object.keys([1, 2, 3])).toEqual(jasmine.arrayContaining(1, 2));
expect(Object.keys({ foo: 1, bar: 2 })).toEqual(jasmine.arrayContaining({'bar': 6, 'foo': 7}));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(['bar', 'foo']));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining({'bar': 6}));

// a, an
expect(typeof 'test').toBe('string');
expect(typeof { foo: 'bar' }).toBe('object');
expect(typeof null).toBe('null');
expect(typeof undefined).toBe('undefined');
expect(typeof new Error).toBe('error');
expect(typeof new Promise).toBe('promise');
expect(typeof new Float32Array()).toBe('float32array');
expect(typeof Symbol()).toBe('symbol');

// instanceof
expect(foo instanceof Foo).toBe(true);

expect(Chai instanceof Tea).toBe(true);
expect([ 1, 2, 3 ] instanceof Array).toBe(true);

// lengthOf

expect([ 1, 2, 3].length).toBe();
expect('foobar'.length).toBe();
