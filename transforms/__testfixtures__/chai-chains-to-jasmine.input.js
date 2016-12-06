// ok
expect('everything').to.be.ok;
expect(1).to.be.ok;
expect(false).to.not.be.ok;
expect(undefined).to.not.be.ok;
expect(null).to.not.be.ok;

// true
expect(true).to.be.true;
expect(1).to.not.be.true;

// false
expect(false).to.be.false;
expect(0).to.not.be.false;

// null
expect(null).to.be.null;
expect(undefined).to.not.be.null;

// undefined
expect(undefined).to.be.undefined;
expect(null).to.not.be.undefined;

// exist
expect(foo).to.exist;
expect(bar).to.not.exist;
expect(baz).to.not.exist;

// equal
expect('hello').to.equal('hello');
expect(42).to.equal(42);
expect(1).to.not.equal(true);
expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });

// throw
var err = new ReferenceError('This is a bad function.');
var fn = function () { throw err; }
expect(fn).to.throw(ReferenceError);
expect(fn).to.throw(Error);
expect(fn).to.throw(/bad function/);
expect(fn).to.not.throw('good function');
expect(fn).to.throw(ReferenceError, /bad function/);
expect(fn).to.throw(err);

// include, string, contain
expect('foobar').to.have.string('bar');

expect([1,2,3]).to.include(2);

expect('foobar').to.contain('foo');

// eql

expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);

// above
expect(10).to.be.above(5);
// least
expect(10).to.be.at.least(10);
// below
expect(5).to.be.below(10);
// most
expect(5).to.be.at.most(5);
// match
expect('foobar').to.match(/^foo/);
// members
expect([1, 2, 3]).to.include.members([3, 2]);
expect([1, 2, 3]).to.not.include.members([3, 2, 8]);

expect([4, 2]).to.have.members([2, 4]);
expect([5, 2]).to.not.have.members([5, 2, 1]);

expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);

