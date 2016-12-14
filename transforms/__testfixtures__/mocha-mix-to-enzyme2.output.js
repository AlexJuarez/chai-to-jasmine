import React from 'react';
import { mount } from 'enzyme';
import TruncatedText from '../_text/TruncatedText';
import SelectableItem from './_SelectableItem';

const ITEM = {
  label: 'label',
  random: 'stuff',
};
const SELECTED = false;
const ID = 'id';

const defaultProps = {
  id: ID,
  item: ITEM,
  onClick: Function.prototype,
  selected: SELECTED,
};

describe('SelectableItem', () => {
  const getRenderedSelectableItem = (config = {}) => (
    mount(
      <SelectableItem
        {...defaultProps}
        {...config}
      />
    )
  );

  it('should correctly pass attributes to rendered node', () => {
    const renderedDom = getRenderedSelectableItem().render();
    expect(renderedDom.children().first().attr('id')).toEqual(ID);
  });

  it('should render label as TruncatedText component', () => {
    const rendered = getRenderedSelectableItem();
    const truncatedText = rendered.find(TruncatedText);
    expect(truncatedText.prop('text')).toEqual(ITEM.label);
    expect(truncatedText.length).toBeTruthy();
  });

  it('should call click handler with correct arguments', () => {
    const clickSpy = jasmine.createSpy();
    const rendered = getRenderedSelectableItem({ onClick: clickSpy });
    rendered.simulate('click');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledWith(ITEM);
  });

  it('should change appearance when selected', () => {
    const renderedDom = getRenderedSelectableItem().render();
    const renderedSelected = getRenderedSelectableItem({ selected: true });
    const renderedSelectedDom = renderedSelected.render();
    expect(renderedDom.children().first().attr('style')._values).not.toEqual(renderedSelectedDom.children().first().attr('style')._values);
  });
});
