jest.unmock('../progress-indicators/LoadingIndicator');
jest.unmock('./Toast');

import React from 'react';
import { mount } from 'enzyme';

import LoadingIndicator from '../progress-indicators/LoadingIndicator';
import Toast from './Toast';

const CONTENT = 'Content';
const ERROR_CONTENT = 'Error Content';
const LIFETIME = 5;

const CONTENT_SELECTOR = '[data-test-toast-content]';
const UNDO_BUTTON_SELECTOR = '[data-test-toast-undo-button]';

jest.useFakeTimers();

describe('Toast', () => {
  beforeEach(() => {
    Toast.defaultProps = {};
    Toast.defaultProps.children = CONTENT;
  });

  it('should render children as content', () => {
    let rendered = mount(
      <Toast />
    );

    let toastContent = rendered.find(CONTENT_SELECTOR).first().text();
    expect(toastContent).toEqual(CONTENT);
  });

  it('should set expired state to false by default', () => {
    let rendered = mount(
      <Toast />
    );

    expect(rendered.state('expired')).toBe(false);
  });

  it('should set expired state to true when lifetime duration has passed', () => {
    let rendered = mount(
      <Toast lifetime={LIFETIME} />
    );

    jest.runAllTimers();
    expect(rendered.state('expired')).toBe(true);
  });

  it('should call onExpire callback when lifetime duration has passed', () => {
    let expireSpy = jasmine.createSpy();
    mount(
    <Toast
    lifetime={LIFETIME}
    onExpire={expireSpy}
      />
    );

    jest.runAllTimers();
    expect(expireSpy).toHaveBeenCalledTimes(1);
  });

  it('should not render toast when expired state is true', () => {
    let rendered = mount(
      <Toast />
    );

    rendered.setState({
      expired: true,
    });

    expect(rendered.html()).toBeFalsy();
  });

  xit('should not allow lifetime to expire the toast while hovered', () => {
    // @TODO: Enable when 0.14 upgrade happens
    // https://github.com/facebook/react/issues/1297

    let expireSpy = jasmine.createSpy();
    let rendered = mount(
      <Toast
    lifetime={LIFETIME}
    onExpire={expireSpy}
      />
    );

    rendered.simulate('mouseOver');
    jest.runAllTimers();

    expect(expireSpy).not.toHaveBeenCalled();
  });

  xit('should correctly delay expiration after a toast has been hovered', () => {
    // @TODO: Enable when 0.14 upgrade happens
    // https://github.com/facebook/react/issues/1297

    let expireSpy = jasmine.createSpy();
    let rendered = mount(
      <Toast
    lifetime={LIFETIME}
    onExpire={expireSpy}
      />
    );

    rendered.simulate('mouseOver');
    jest.runAllTimers();
    expect(expireSpy).not.toHaveBeenCalled();

    rendered.simulate('mouseOut');
    jest.runAllTimers();
    expect(expireSpy).toHaveBeenCalledTimes(1);
  });

  describe('Undo functionality', () => {
    it('should not display undo button without onUndo prop', () => {
      let rendered = mount(
        <Toast />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR);
      expect(undoButton.isEmpty()).toBe(true);
    });

    it('should display undo button when onUndo prop is provided', () => {
      let rendered = mount(
        <Toast onUndo={() => {}} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      expect(undoButton).not.toBeUndefined();
    });

    it('should ignore the lifetime expiration after undoing state is set to true', () => {
      let rendered = mount(
        <Toast lifetime={LIFETIME} />
      );

      rendered.setState({
        undoing: true,
      });

      jest.runAllTimers();
      expect(rendered.state('expired')).toBe(false);
    });

    it('should call onUndo click handler with correct arguments when undo button is clicked', () => {
      let undoSpy = jasmine.createSpy();
      let rendered = mount(
        <Toast onUndo={undoSpy} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      expect(undoSpy).toHaveBeenCalledTimes(1);
    });

    it('should set expired and undoing states when calling onUndo "done" callback', () => {
      let undoCallback = (obj) => { obj.done(); };
      let rendered = mount(
        <Toast onUndo={undoCallback} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      expect(rendered.state('undoing')).toBe(false);
      expect(rendered.state('expired')).toBe(true);
    });

    it('should correctly set loading state between onUndo click and "error" callback', () => {
      let undoCallback = (obj) => {
        setTimeout(() => {
          obj.error(ERROR_CONTENT);
        }, 5);
      };
      let rendered = mount(
        <Toast onUndo={undoCallback} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      expect(rendered.state('loading')).toBe(true);

      jest.runAllTimers();
      expect(rendered.state('loading')).toBe(false);
    });

    it('should correctly display loading indicator to match loading state', () => {
      let undoCallback = (obj) => {
        setTimeout(() => {
          obj.error(ERROR_CONTENT);
        }, 5);
      };
      let rendered = mount(
        <Toast onUndo={undoCallback} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      let loadingIndicator = rendered.find(LoadingIndicator);
      expect(loadingIndicator.at(0)).not.toBeUndefined();

      jest.runAllTimers();
      loadingIndicator = rendered.find(LoadingIndicator);
      expect(loadingIndicator).not.toBeUndefined();
    });

    it('should correctly set state after calling onUndo "error" callback', () => {
      let undoCallback = (obj) => { obj.error(ERROR_CONTENT); };
      let rendered = mount(
        <Toast onUndo={undoCallback} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      expect(rendered.state('undoing')).toBe(true);
    });

    it('should set error message content after calling onUndo "error" callback', () => {
      let undoCallback = (obj) => { obj.error(ERROR_CONTENT); };
      let rendered = mount(
        <Toast onUndo={undoCallback} />
      );

      let undoButton = rendered.find(UNDO_BUTTON_SELECTOR).first();
      undoButton.simulate('click');

      let toastContent = rendered.find(CONTENT_SELECTOR).first().text();
      expect(toastContent).toEqual(ERROR_CONTENT);
    });
  });
});
