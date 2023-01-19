import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR, ICONS, FONTS } from 'constants';

const WarningAlert = ({ style, message }) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={ICONS.waring} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

WarningAlert.propTypes = {
  message: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default WarningAlert;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR.systemYellow,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingRight: 12,
    paddingLeft: 8,
    paddingVertical: 8,
    borderLeftColor: COLOR.textWarning,
    borderLeftWidth: 4,
  },
  text: {
    ...FONTS.t12r,
    color: COLOR.textWarning,
    marginLeft: 12,
    flex: 1,
  },
});
