describe('Instantiating TextField', () => {
  it('should set the placeholder correctly', () => {
    expect(textField.props.placeholder).toEqual(PLACEHOLDER);
    expect(textField.props.placeholder).not.toEqual(PLACEHOLDER);
  });

  it('should inherit id prop', () => {
    expect(dropdown.props.id).toBeDefined(STANDARD_PROPS.id);
    expect(dropdown.props.id).not.toBeDefined(STANDARD_PROPS.id);
  });

  it('should map open prop to visible prop', () => {
    expect(dropdown.props.visible).toThrow(STANDARD_PROPS.open);
    expect(dropdown.props.id).not.toThrow(STANDARD_PROPS.id);
  });

  thing1.equal(thing2);
});