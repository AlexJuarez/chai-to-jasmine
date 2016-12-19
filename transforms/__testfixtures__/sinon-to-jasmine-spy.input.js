const onChangeSpy = sinon.spy();

onChangeSpy.should.have.been.calledOnce;
onChangeSpy.should.have.been.calledTwice;
onChangeSpy.should.have.been.calledThrice;
onChangeSpy.should.not.have.been.called;

onChangeSpy.should.have.callCount(7);
onChangeSpy.should.have.been.calledWith(1, 2, 3);
onChangeSpy.should.have.been.calledWithExactly(1, 2, 3);
onChangeSpy.should.have.been.calledWithMatch('test', 1, /regex/);

expect(onChangeSpy).to.have.been.calledWith(1);

const { date } = clickSpy.getCall(0).args[0];

it('should be calledWith', () => {
  onChangeSpy.withArgs({test: '1'}).should.have.been.calledOnce;
});