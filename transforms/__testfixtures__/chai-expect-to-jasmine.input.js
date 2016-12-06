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
