import React from 'react';

import MochaMix from 'mocha-mix';
import {
  elementQuerySelector,
  expect,
  sinon,
  standardMocks,
} from '../TestUtils';
import { ReactTestUtils } from '../ReactUtils';
const {
  findRenderedComponentWithType,
  renderIntoDocument,
} = ReactTestUtils;
import { NOOP } from '../base/Base';

const PLACEHOLDER = 'Placeholder';

const ITEMS = [{
  value: 'Item 1',
  label: 'Item 1',
  extra: 'yo dawg',
}, {
  value: 'item2',
  label: 'Item 2, an edge case, a really long thing, we should support this',
}, {
  value: 'Item 3',
  label: 'Item 3',
}, {
  value: 'Item 4',
  label: 'Foo',
}, {
  value: 'Item 5',
  label: 'Item 5',
}, {
  value: 'Item 6',
  label: 'Bar',
}];

const anchorComponent = <button>Click me</button>;

const STANDARD_PROPS = {
  anchorComponent,
  id: 'test-id',
  items: ITEMS,
  label: 'Dummy Label',
  onBlur: NOOP,
  onChange: NOOP,
  onFocus: NOOP,
  onItemSelect: NOOP,
  open: false,
  placeholder: PLACEHOLDER,
  secondaryText: 'Something interesting here',
  validationState: 'base',
  value: ITEMS[0].value,
};

describe('SingleSelect', () => {
  const mix = MochaMix.mix({
    rootDir: __dirname,
    import: './_SingleSelect',
    mocks: {
      ...standardMocks,
    },
  });

  let DropdownTargetBase;
  let rendered;
  let SingleSelect;
  let TextField;

  before(() => {
    DropdownTargetBase = require('../dropdowns/_DropdownTargetBase');
    TextField = require('../input-fields/TextField');
  });

  beforeEach(() => {
    SingleSelect = mix.import();
    rendered = renderIntoDocument(<SingleSelect {...STANDARD_PROPS} />);
  });

  function getDropdownComponent() {
    // Throws error unless props.open === true
    return findRenderedComponentWithType(rendered, DropdownTargetBase);
  }

  function getContainerComponent() {
    const dropdown = getDropdownComponent();
    return dropdown.props.content;
  }

  function getTextFieldComponent() {
    return findRenderedComponentWithType(rendered, TextField);
  }

  function getSelectableItemList() {
    const txlContainer = getContainerComponent();
    return txlContainer.props.children[0];
  }

  describe('Instantiating DropdownTargetBase', () => {
    let dropdown;
    beforeEach(() => {
      dropdown = getDropdownComponent();
    });

    it('should inherit id prop', () => {
      dropdown.props.id.should.equal(STANDARD_PROPS.id);
    });

    it('should map open prop to visible prop', () => {
      dropdown.props.visible.should.equal(STANDARD_PROPS.open);
    });

    it('should render anchor component within container, if provided', () => {
      const { anchorComponent, ...PROPS_WITHOUT_ANCHOR } = STANDARD_PROPS;
      const container = getContainerComponent();

      // this is admittedly brittle, but not sure how else to get to the rendered anchor component
      const anchorComponentFromRendered = container.props.children[1].props.children;

      // Container children should be SelectableItemList and <div> w/ anchorComponent inside
      expect(anchorComponentFromRendered).to.equal(anchorComponent);

      // render w/o anchorComponent
      rendered = renderIntoDocument(<SingleSelect {...PROPS_WITHOUT_ANCHOR} />);
      const containerWithoutAnchor = getContainerComponent();

      // the {!!anchorComponent && ...} guard statement explicitly casts to false
      expect(containerWithoutAnchor.props.children[1]).to.be.false;
    });
  });

  describe('Instantiating TextField', () => {
    const TEXT_FIELD_INHERITED_PROPS = [
      'label',
      'value',
      'secondaryText',
      'validationState',
    ];
    const DOWN_ARROW_SELECTOR = '[data-component=TxlIconArrowDown]';
    const UP_ARROW_SELECTOR = '[data-component=TxlIconArrowUp]';
    let textField;

    beforeEach(() => {
      textField = getTextFieldComponent();
    });

    it('should generate ID', () => {
      textField.props.id.should.equal(`${STANDARD_PROPS.id}-input`);
    });

    it(`should pass ${TEXT_FIELD_INHERITED_PROPS.join(', ')} props straight through`, () => {
      TEXT_FIELD_INHERITED_PROPS.forEach(name => {
        textField.props[name].should.equal(STANDARD_PROPS[name]);
      });
    });

    it('should set the placeholder correctly', () => {
      textField.props.placeholder.should.equal(PLACEHOLDER);
    });

    it('should call onFocus on text field focus or click', () => {
      // TextField.onFocus={this._handleTextFieldFocus}
      // TextField.onClick={this._handleTextFieldFocus}
      const onFocusSpy = sinon.spy();
      const elemSelectSpy = sinon.spy();
      rendered = renderIntoDocument(<SingleSelect {...STANDARD_PROPS} onFocus={onFocusSpy} />);
      rendered._input.select = elemSelectSpy;

      rendered._handleTextFieldFocus();
      elemSelectSpy.should.have.been.calledOnce;
      onFocusSpy.should.have.been.calledOnce;
    });

    it('should call onChange on text field change', () => {
      // TextField.onChange={this._handleTextFieldChange}
      const onChangeSpy = sinon.spy();
      const DUMMY_TEXT_FIELD_VAL = { value: ITEMS[2] };

      rendered = renderIntoDocument(<SingleSelect {...STANDARD_PROPS} onChange={onChangeSpy} />);
      rendered._handleTextFieldChange(DUMMY_TEXT_FIELD_VAL);

      onChangeSpy.should.have.been.calledOnce;
      onChangeSpy.should.have.been.calledWith(DUMMY_TEXT_FIELD_VAL);
    });

    it('should call onBlur on text field blur', () => {
      // TextField.onBlur={this._handleTextFieldBlur}
      const onBlurSpy = sinon.spy();

      rendered = renderIntoDocument(<SingleSelect {...STANDARD_PROPS} onBlur={onBlurSpy} />);
      rendered._handleTextFieldBlur();

      onBlurSpy.should.have.been.calledOnce;
    });

    it('should call not call onBlur on text field blur if blur is disabled', () => {
      const onBlurSpy = sinon.spy();

      rendered = renderIntoDocument(<SingleSelect {...STANDARD_PROPS} onBlur={onBlurSpy} />);
      rendered.setState({ open: true });
      rendered._disableBlur();
      rendered._handleTextFieldBlur();

      onBlurSpy.should.not.have.been.calledOnce;
    });

    it('should render down arrow when dropdown is closed', () => {
      // dropdown closed, down arrow visible
      expect(elementQuerySelector(rendered, DOWN_ARROW_SELECTOR)).to.exist;
      expect(elementQuerySelector(rendered, UP_ARROW_SELECTOR)).to.not.exist;
    });

    it('should render up arrow when dropdown is open', () => {
      // dropdown open, up arrow visible
      rendered = renderIntoDocument(
        <SingleSelect
      {...STANDARD_PROPS}
      open
      />
      );
      expect(elementQuerySelector(rendered, DOWN_ARROW_SELECTOR)).to.not.exist;
      expect(elementQuerySelector(rendered, UP_ARROW_SELECTOR)).to.exist;
    });
  });

  describe('Instantiating SelectableItemList', () => {
    let itemList;

    beforeEach(() => {
      itemList = getSelectableItemList();
    });

    it('should generate ID', () => {
      itemList.props.id.should.equal(`${STANDARD_PROPS.id}-items`);
    });

    it('should pass items collection to SelectableItemList descendant', () => {
      itemList.props.items.should.deep.equal(ITEMS);
    });

    it('it should properly pass the selected value', () => {
      itemList.props.selectedValues.length.should.equal(1);
      itemList.props.selectedValues[0].should.equal(STANDARD_PROPS.value);
    });

    describe('Clicking item in list', () => {
      let onChangeSpy;
      let onItemSelectSpy;

      beforeEach(() => {
        onChangeSpy = sinon.spy();
        onItemSelectSpy = sinon.spy();
        rendered = renderIntoDocument(
          <SingleSelect
        {...STANDARD_PROPS}
        onChange={onChangeSpy}
        onItemSelect={onItemSelectSpy}
          />);
      });

      it('should call onChange if noItemsMessage is undefined', () => {
        rendered._handleItemClick({});
        onChangeSpy.should.have.been.calledOnce;
      });

      it('should call onChange if noItemsMessage is false', () => {
        rendered._handleItemClick({ noItemsMessage: false });
        onChangeSpy.should.have.been.calledOnce;
      });

      it('should *not* call onChange if noItemsMessage is true', () => {
        rendered._handleItemClick({ noItemsMessage: true });
        onChangeSpy.should.have.not.been.called;
      });

      it('should *not* call onChange if noItemsMessage is truthy', () => {
        rendered._handleItemClick({ noItemsMessage: 1 });
        onChangeSpy.should.have.not.been.called;
      });

      it('should call onItemSelect if noItemsMessage is undefined', () => {
        rendered._handleItemClick({});
        onItemSelectSpy.should.have.been.calledOnce;
      });

      it('should call onItemSelect if noItemsMessage is false', () => {
        rendered._handleItemClick({ noItemsMessage: false });
        onItemSelectSpy.should.have.been.calledOnce;
      });

      it('should *not* call onItemSelect if noItemsMessage is true', () => {
        rendered._handleItemClick({ noItemsMessage: true });
        onItemSelectSpy.should.have.not.been.called;
      });

      it('should *not* call onItemSelect if noItemsMessage is truthy', () => {
        rendered._handleItemClick({ noItemsMessage: 1 });
        onItemSelectSpy.should.have.not.been.called;
      });
    });
  });
});
