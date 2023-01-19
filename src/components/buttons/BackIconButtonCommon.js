import React from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import icons from 'constants/icons';

const BackIconButtonCommon = ({
  onPress,
  style,
  imageProps,
  ...otherProps
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    navigation.goBack();
  };

  return (
    <TouchableOpacity
      style={[{ width: 20, height: 20 }, style]}
      onPress={handlePress}
      {...otherProps}>
      <Image source={icons.backButton} resizeMode={'cover'} {...imageProps} />
    </TouchableOpacity>
  );
};

BackIconButtonCommon.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  imageProps: PropTypes.object,
};

export default BackIconButtonCommon;
