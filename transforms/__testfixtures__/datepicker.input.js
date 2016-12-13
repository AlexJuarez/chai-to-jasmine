import React from 'react';
import MochaMix from 'mocha-mix';
import {
  expect,
  sinon,
  standardMocks,
} from '../TestUtils';
import {ReactTestUtils} from '../ReactUtils';

const {
  findRenderedComponentWithType,
  renderIntoDocument
} = ReactTestUtils;

describe('DatePicker', () => {
  const mix = MochaMix.mix({
    rootDir : __dirname,
    import  : './_ControlledDatePicker',
    mocks   : {
      ...standardMocks,
      Calendar            : '../calendar-picker/_SingleCalendarPicker',
      DropdownContent     : '../dropdowns/_DropdownContent',
      IconButton          : '../buttons/IconButton',
      IconCalendarOutline : '../icons/CalendarOutline',
      TextField           : './TextField',
    }
  });

  const STANDARD_PROPS = {
    onChange       : x => x,
    open           : false,
    updateDropdown : x => x
  };

  let DatePicker;
  let datePicker;
  let textField;
  let updateDropdownSpy;

  const findCalendar = dp => findRenderedComponentWithType(dp, mix.mocks.Calendar);
  const findTextField = dp => dp.refs.dateTextField;

  beforeEach(() => {
    DatePicker = mix.import();
  });

  describe('Closed dropdown', () => {
    beforeEach(() => {
      updateDropdownSpy = jasmine.createSpy();
      datePicker = renderIntoDocument(
        <DatePicker
          {...STANDARD_PROPS}
          updateDropdown={updateDropdownSpy}
        />
      );
      textField = findTextField(datePicker);
    });

    it('should open dropdown when TextField is focused', () => {
      textField.props.onFocus();
      updateDropdownSpy.should.toHaveBeenCalledWith({open: true});
      updateDropdownSpy.should.toHaveBeenCalledTimes(1);
    });

    it('should focus text field when calendar icon is clicked', () => {
      const focusStub = jasmine.spyOn(textField, 'focus');

      // trigger click handler on IconButton
      textField.props._afterContent.props.onClick();
      focusStub.should.toHaveBeenCalledTimes(1);
    });
  });

  describe('Open dropdown', () => {
    let onChangeSpy;

    beforeEach(() => {
      updateDropdownSpy = jasmine.createSpy();
      onChangeSpy = jasmine.createSpy();
      datePicker = renderIntoDocument(
        <DatePicker
          {...STANDARD_PROPS}
          open={true}
          onChange={onChangeSpy}
          updateDropdown={updateDropdownSpy}
        />
      );
      textField = findTextField(datePicker);
    });

    it('should close dropdown when TextField is blurred', () => {
      textField.props.onBlur();
      updateDropdownSpy.should.toHaveBeenCalledWith({open: false});
      updateDropdownSpy.should.toHaveBeenCalledTimes(1);
    });

    it('should focus text field when calendar icon is clicked', () => {
      const focusStub = jasmine.spyOn(textField, 'focus');

      // trigger click handler on IconButton
      textField.props._afterContent.props.onClick();
      focusStub.should.toHaveBeenCalledTimes(1);
    });

    describe('Selecting dates', () => {
      const STUB_DATE = '02/22/1981';
      const momentMock = {format : () => STUB_DATE};
      let calendar;

      beforeEach(() => {
        calendar = findCalendar(datePicker);
      });

      it('should call onChange when calendar onDateClick occurs', () => {
        calendar.props.onDateClick({date : momentMock});
        onChangeSpy.should.toHaveBeenCalledWith({value : STUB_DATE});
        onChangeSpy.should.toHaveBeenCalledTimes(1);
      });

      it('should call onChange with field value obj when user enters text', () => {
        const TEXT_FIELD_VAL = {value : STUB_DATE};
        textField.props.onChange(TEXT_FIELD_VAL);
        onChangeSpy.should.toHaveBeenCalledWith(TEXT_FIELD_VAL);
        onChangeSpy.should.toHaveBeenCalledTimes(1);
      });

      it('should close dropdown calendar when onDateClick occurs', () => {
        calendar.props.onDateClick({date : momentMock});
        updateDropdownSpy.should.toHaveBeenCalledWith({open : false});
        updateDropdownSpy.should.toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Validation', () => {
    it('should pass validationState as "error" if value is invalid format', () => {
      const InvalidDate = '01/05/20421';
      const datePicker = renderIntoDocument(
        <DatePicker
          {...STANDARD_PROPS}
          value={InvalidDate}
        />
      );

      const textField = findTextField(datePicker);
      expect(textField.props.validationState).to.equal('error');
    });

    it('should pass validationState as "base" if value is valid format', () => {
      const ValidDate = '01/05/2042';
      const datePicker = renderIntoDocument(
        <DatePicker
          {...STANDARD_PROPS}
          value={ValidDate}
        />
      );

      const textField = findTextField(datePicker);
      expect(textField.props.validationState).to.equal('base');
    });
  });
});