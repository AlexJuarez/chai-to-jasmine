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
expect(foo).toEqual(jasmine.anything());
expect(bar).not.toEqual(jasmine.anything());
expect(baz).not.toEqual(jasmine.anything());

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
