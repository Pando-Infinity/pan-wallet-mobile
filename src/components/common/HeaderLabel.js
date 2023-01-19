import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { BackIconButtonCommon } from 'components/buttons';
import { FONTS, SIZES, COLOR } from 'constants/themes';

const HeaderLabel = ({
  label,
  styleLabel,
  styleHeader,
  buttonProps,
  onBack,
  hiddenBackButton,
  rightButton,
  ...otherProps
}) => {
  const { style: buttonStyle, ...otherButtonProps } = buttonProps;

  return (
    <View style={[styles.header, styleHeader]} {...otherProps}>
      {!hiddenBackButton && (
        <BackIconButtonCommon
          style={[styles.backButton, buttonStyle]}
          onPress={onBack}
          {...otherButtonProps}
        />
      )}
      {label && (
        <Text
          style={[styles.label, styleLabel]}
          ellipsizeMode={'tail'}
          numberOfLines={1}>
          {label}
        </Text>
      )}
      {rightButton && rightButton}
    </View>
  );
};

HeaderLabel.propTypes = {
  label: PropTypes.string,
  styleHeader: PropTypes.object,
  styleLabel: PropTypes.object,
  buttonProps: PropTypes.object,
  onBack: PropTypes.func,
  hiddenBackButton: PropTypes.bool,
  rightButton: PropTypes.node,
};

HeaderLabel.defaultProps = {
  buttonProps: {},
  hiddenBackButton: false,
};

export default HeaderLabel;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    position: 'relative',
    marginTop: 30,
  },
  label: {
    ...FONTS.t16r,
    fontWeight: SIZES.bold,
    color: COLOR.white,
    textAlign: 'center',
    flex: 1,
    marginLeft: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 8,
    zIndex: 2,
  },
});
