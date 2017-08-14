import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import birthdayIconOff from '../../../../app/images/onboarding/birthday-icon-off.png';
import birthdayIcon from '../../../../app/images/onboarding/birthday-icon-on.png';
import ProfileField from '../../../../app/containers/onBoardingFlow/profile/ProfileField';

describe('ProfileField Component', () => {
  const initialState = {
    auth: {},
    user: {},
  };
  const store = configureStore([asyncActionMiddleware, thunk])(initialState);

  const valEmptyLabel = {
    type: 'birthdate',
    icon: birthdayIcon,
    iconOff: birthdayIconOff,
  };
  const val = {
    ...valEmptyLabel,
    label: '2017-08-01',
  };

  const wrapper = shallow(
    <ProfileField
    	value={val}
    	key={val.type}
    	setPickerType={'birthdate'}
      icon={val.icon}
    />,
    { context: { store } },
  );
  const wrapperEmptyLabel = shallow(
    <ProfileField
    	value={valEmptyLabel}
    	key={valEmptyLabel.type}
    	setPickerType={'birthdate'}
      icon={valEmptyLabel.icon}
    />,
    { context: { store } },
  );

  let render;
  beforeEach(() => {
    store.clearActions();
    render = wrapper.dive();
  });

  test('renders as expected', () => {
    expect(render).toMatchSnapshot();
  });

  test('renders a BodyText if label exists', () => {
  	expect(wrapper.dive().find('BodyText')).toHaveLength(1);
  });

  test('renders a SecondaryText if no label found', () => {
    expect(wrapperEmptyLabel.dive().find('SecondaryText')).toHaveLength(1);
  });
});
