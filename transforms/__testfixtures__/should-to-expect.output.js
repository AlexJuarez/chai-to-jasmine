describe('Instantiating TextField', () => {
  it('should set the placeholder correctly', () => {
    expect(textField.props.placeholder).equal(PLACEHOLDER);
    expect(textField.props.placeholder).not.equal(PLACEHOLDER);
  });

  it('should inherit id prop', () => {
    expect(dropdown.props.id).exist(STANDARD_PROPS.id);
    expect(dropdown.props.id).not.exist(STANDARD_PROPS.id);
  });

  it('should map open prop to visible prop', () => {
    expect(dropdown.props.visible).Throw(STANDARD_PROPS.open);
    expect(dropdown.props.id).not.Throw(STANDARD_PROPS.id);
  });

  thing1.equal(thing2);
});