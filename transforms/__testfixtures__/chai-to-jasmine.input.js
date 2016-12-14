describe('Instantiating TextField', () => {
  it('should set the placeholder correctly', () => {
    textField.props.placeholder.should.equal(PLACEHOLDER);
    textField.props.placeholder.should.not.equal(PLACEHOLDER);
  });

  it('should inherit id prop', () => {
    dropdown.props.id.should.equal(STANDARD_PROPS.id);
    dropdown.props.id.should.not.equal(STANDARD_PROPS.id);
  });

  it('should map open prop to visible prop', () => {
    dropdown.props.visible.should.Throw(STANDARD_PROPS.open);
    dropdown.props.id.should.not.Throw(STANDARD_PROPS.id);
  });

  thing1.equal(thing2);
});

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
expect({ foo: 1, bar: 2}).to.contain({ bar: 2 });

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

// keys
expect([1, 2, 3]).to.have.all.keys(1, 2);
expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys({'bar': 6});

// a, an
expect('test').to.be.a('string');
expect({ foo: 'bar' }).to.be.an('object');
expect(null).to.be.a('null');
expect(undefined).to.be.an('undefined');
expect(new Error).to.be.an('error');
expect(new Promise).to.be.a('promise');
expect(new Float32Array()).to.be.a('float32array');
expect(Symbol()).to.be.a('symbol');

// instanceof
expect(foo).to.be.an.instanceof(Foo);

expect(Chai).to.be.an.instanceof(Tea);
expect([ 1, 2, 3 ]).to.be.instanceof(Array);

// lengthOf

expect([ 1, 2, 3]).to.have.lengthOf(3);
expect('foobar').to.have.lengthOf(6);

// ownPropertyDescriptor

expect('test').to.have.ownPropertyDescriptor('length');
expect('test').to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 4 });
expect('test').not.to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 3 });

// ownProperty

expect('test').to.have.ownProperty('length');

// property

// simple referencing
var obj = { foo: 'bar' };
expect(obj).to.have.property('foo');
expect(obj).to.have.property('foo', 'bar');
