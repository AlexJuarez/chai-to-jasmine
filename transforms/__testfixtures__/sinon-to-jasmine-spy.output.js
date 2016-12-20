const onChangeSpy = jasmine.createSpy();

onChangeSpy.should.toHaveBeenCalledTimes(1);
onChangeSpy.should.toHaveBeenCalledTimes(2);
onChangeSpy.should.toHaveBeenCalledTimes(3);
onChangeSpy.should.not.toHaveBeenCalled();

onChangeSpy.should.toHaveBeenCalledTimes(7);
onChangeSpy.should.toHaveBeenCalledWith(1, 2, 3);
onChangeSpy.should.toHaveBeenCalledWith(1, 2, 3);
onChangeSpy.should.toHaveBeenCalledWith(jasmine.stringMatching('test'), 1, jasmine.stringMatching(/regex/));

expect(onChangeSpy).toHaveBeenCalledWith(1);

onChangeSpy.should.toHaveBeenCalledTimes(1);
onChangeSpy.calls.mostRecent().args[0].should.have.property('on', true);

const { date } = onChangeSpy.calls.argsFor(0)[0];

it('should be calledWith', () => {
  onChangeSpy.should.toHaveBeenCalledWith({test: '1'});
  onChangeSpy.should.toHaveBeenCalledTimes(1);
});
