describe('Instantiating TextField', () => {
  it('should set the placeholder correctly', () => {
    textField.props.placeholder.should.equal(PLACEHOLDER);
    textField.props.placeholder.should.not.equal(PLACEHOLDER);
  });

  it('should inherit id prop', () => {
    dropdown.props.id.should.exist(STANDARD_PROPS.id);
    dropdown.props.id.should.not.exist(STANDARD_PROPS.id);
  });

  it('should map open prop to visible prop', () => {
    dropdown.props.visible.should.Throw(STANDARD_PROPS.open);
    dropdown.props.id.should.not.Throw(STANDARD_PROPS.id);
  });

  thing1.equal(thing2);
});