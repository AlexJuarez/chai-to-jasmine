import React from 'react';
import MochaMix from 'mocha-mix';

import {
  findDOMNode,
  ReactTestUtils,
} from '../ReactUtils';
import {
  expect,
  simulateEvent,
  sinon,
  standardMocks,
} from '../TestUtils';
const {
  findRenderedComponentWithType,
  renderIntoDocument,
} = ReactTestUtils;

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
  const mix = MochaMix.mix({
    rootDir: __dirname,
    import: './_SelectableItem',
    mocks: {
      ...standardMocks,
      TruncatedText: '../_text/TruncatedText',
    },
  });

  const getRenderedSelectableItem = (config = {}) => (
    renderIntoDocument(
      <SelectableItem
        {...defaultProps}
        {...config}
      />
    )
  );

  let SelectableItem;

  before(() => {
    SelectableItem = mix.import();
  });

  beforeEach(() => {
    SelectableItem = mix.import();
  });

  it('should correctly pass attributes to rendered node', () => {
    const renderedDom = findDOMNode(getRenderedSelectableItem());
    expect(renderedDom.id).toEqual(ID);
  });

  it('should render label as TruncatedText component', () => {
    const rendered = getRenderedSelectableItem();
    const truncatedText = findRenderedComponentWithType(rendered, mix.mocks.TruncatedText);
    expect(truncatedText.props.text).toEqual(ITEM.label);
    expect(truncatedText.length).toBeTruthy();
  });

  it('should call click handler with correct arguments', () => {
    const clickSpy = jasmine.createSpy();
    const rendered = getRenderedSelectableItem({ onClick: clickSpy });
    simulateEvent(rendered, 'click');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledWith(ITEM);
  });

  it('should change appearance when selected', () => {
    const renderedDom = findDOMNode(getRenderedSelectableItem());
    const renderedSelected = getRenderedSelectableItem({ selected: true });
    const renderedSelectedDom = findDOMNode(renderedSelected);
    expect(renderedDom.style._values).not.toEqual(renderedSelectedDom.style._values);
  });
});