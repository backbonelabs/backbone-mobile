import React from 'react';
import { shallow } from 'enzyme';
import birthdayIconOff from '../../../../app/images/onboarding/birthday-icon-off.png';
import birthdayIcon from '../../../../app/images/onboarding/birthday-icon-on.png';
import ProfileField from '../../../../app/containers/onBoardingFlow/profile/ProfileField';

describe('ProfileField Component', () => {
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
    	setPickerType={() => {
        // Empty test function
      }}
      icon={val.icon}
    />
  );
  const wrapperEmptyLabel = shallow(
    <ProfileField
    	value={valEmptyLabel}
    	key={valEmptyLabel.type}
    	setPickerType={() => {
        // Empty test function
      }}
      icon={valEmptyLabel.icon}
    />
  );

  let render = wrapper.dive();

  test('renders as expected', () => {
    expect(render).toMatchSnapshot();
  });

  test('renders a BodyText if label exists', () => {
  	expect(wrapper.find('BodyText')).toHaveLength(1);
  });

  test('renders a SecondaryText if no label found', () => {
    expect(wrapperEmptyLabel.find('SecondaryText')).toHaveLength(1);
  });
});
