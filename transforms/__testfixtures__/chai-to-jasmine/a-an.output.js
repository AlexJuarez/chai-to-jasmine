expect(typeof 'test').toBe('string');
expect(typeof { foo: 'bar' }).toBe('object');
expect(typeof null).toBe('null');
expect(typeof undefined).toBe('undefined');
expect(typeof new Error).toBe('error');
expect(typeof new Promise).toBe('promise');
expect(typeof new Float32Array()).toBe('float32array');
expect(typeof Symbol()).toBe('symbol');