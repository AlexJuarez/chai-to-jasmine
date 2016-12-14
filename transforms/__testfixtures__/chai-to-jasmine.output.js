describe('Instantiating TextField', () => {
  it('should set the placeholder correctly', () => {
    expect(textField.props.placeholder).toBe(PLACEHOLDER);
    expect(textField.props.placeholder).not.toBe(PLACEHOLDER);
  });

  it('should inherit id prop', () => {
    expect(dropdown.props.id).toBe(STANDARD_PROPS.id);
    expect(dropdown.props.id).not.toBe(STANDARD_PROPS.id);
  });

  it('should map open prop to visible prop', () => {
    expect(dropdown.props.visible).toThrowError(STANDARD_PROPS.open);
    expect(dropdown.props.id).not.toThrowError(STANDARD_PROPS.id);
  });

  thing1.equal(thing2);
});

// ok
expect('everything').toBeTruthy();
expect(1).toBeTruthy();
expect(false).toBeFalsy();
expect(undefined).toBeFalsy();
expect(null).toBeFalsy();

// true
expect(true).toBe(true);
expect(1).not.toBe(true);

// false
expect(false).toBe(false);
expect(0).not.toBe(false);

// null
expect(null).toBeNull();
expect(undefined).not.toBeNull();

// undefined
expect(undefined).toBeUndefined();
expect(null).toBeDefined();

// exist
expect(foo).not.toBeUndefined();
expect(bar).toBeFalsy();
expect(baz).toBeFalsy();
expect(input).not.toBeUndefined();

// equal
expect('hello').toBe('hello');
expect(42).toBe(42);
expect(1).not.toBe(true);
expect({ foo: 'bar' }).not.toBe({ foo: 'bar' });
expect({ foo: 'bar' }).toEqual({ foo: 'bar' });

// throw
var err = new ReferenceError('This is a bad function.');
var fn = function () { throw err; }
expect(fn).toThrowError(ReferenceError);
expect(fn).toThrowError(Error);
expect(fn).toThrowError(/bad function/);
expect(fn).not.toThrowError('good function');
expect(fn).toThrowError(ReferenceError, /bad function/);
expect(fn).toThrowError(err);

// include, string, contain
expect('foobar').toContain('bar');

expect([1,2,3]).toContain(2);

expect('foobar').toContain('foo');
expect({ foo: 1, bar: 2}).toEqual(jasmine.objectContaining({ bar: 2 }));

// eql

expect({ foo: 'bar' }).toEqual({ foo: 'bar' });
expect([ 1, 2, 3 ]).toEqual([ 1, 2, 3 ]);

// above
expect(10).toBeGreaterThan(5);
// least
expect(10).toBeGreaterThanOrEqual(10);
// below
expect(5).toBeLessThan(10);
// most
expect(5).toBeLessThanOrEqual(5);
// match
expect('foobar').toMatch(/^foo/);
// members
expect([1, 2, 3]).toEqual(jasmine.arrayContaining([3, 2]));
expect([1, 2, 3]).not.toEqual(jasmine.arrayContaining([3, 2, 8]));

expect([4, 2]).toEqual(jasmine.arrayContaining([2, 4]));
expect([5, 2]).not.toEqual(jasmine.arrayContaining([5, 2, 1]));

expect([{ id: 1 }]).toEqual(jasmine.arrayContaining([{ id: 1 }]));

// keys
expect([1, 2, 3]).toEqual(jasmine.arrayContaining([1, 2]));
expect(Object.keys({ foo: 1, bar: 2 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6, 'foo': 7})));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(['bar', 'foo']));
expect(Object.keys({ foo: 1, bar: 2, baz: 3 })).toEqual(jasmine.arrayContaining(Object.keys({'bar': 6})));

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

expect([ 1, 2, 3].length).toBe(3);
expect('foobar'.length).toBe(6);

// ownPropertyDescriptor

expect(Object.getOwnPropertyDescriptor('test', 'length')).not.toBeUndefined();
expect(Object.getOwnPropertyDescriptor('test', 'length')).toEqual({ enumerable: false, configurable: false, writable: false, value: 4 });
expect(Object.getOwnPropertyDescriptor('test', 'length')).toEqual({ enumerable: false, configurable: false, writable: false, value: 3 });

// ownProperty

expect('test'.hasOwnProperty('length')).toBeTruthy();

// property

// simple referencing
var obj = { foo: 'bar' };
expect(obj.hasOwnProperty('foo')).toBeTruthy();
expect(obj['foo']).toEqual('bar');
