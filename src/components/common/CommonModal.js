import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { COLOR } from 'constants';
import { SIZES } from 'constants';
import { FONTS } from 'constants';

const CommonModal = ({
  isVisible,
  onClose,
  title,
  message,
  buttonLabel,
  buttonProps = {},
  textProps = {},
  style,
  contentProps = {},
  ...otherProps
}) => {
  const { style: buttonStyle = {} } = buttonProps;
  const { style: textStyle = {} } = textProps;
  const {
    style: contentStyle = {},
    titleStyle = {},
    messageStyle = {},
  } = contentProps;
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.7}
      backdropColor={COLOR.black}
      deviceHeight={SIZES.heightScreen}
      animationIn="zoomIn"
      animationOut="zoomOut"
      transparent={true}
      {...otherProps}>
      <View style={[styles.root, style]}>
        <View style={[styles.contentWrapper, contentStyle]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          <Text style={[styles.content, messageStyle]}>{message}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.button, buttonStyle]}>
          <Text style={[styles.buttonLabel, textStyle]}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

CommonModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonLabel: PropTypes.string,
  buttonProps: PropTypes.object,
  textProps: PropTypes.object,
  style: PropTypes.object,
  contentProps: PropTypes.object,
};

export default CommonModal;

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLOR.simpleBackground,
    borderRadius: 24,
    alignItems: 'center',
  },
  title: {
    ...FONTS.t16b,
    color: COLOR.white,
  },
  content: {
    ...FONTS.t14r,
    color: COLOR.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  contentWrapper: {
    alignItems: 'center',
    borderBottomColor: COLOR.gray5,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: '100%',
  },
  buttonLabel: {
    ...FONTS.t14b,
    color: COLOR.white,
    paddingHorizontal: 24,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
