import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS } from 'constants';

const RowInfo = ({
  title,
  content,
  style,
  contentStyle,
  titleStyle,
  imageIcon,
}) => {
  return (
    <View style={[styles.root, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {imageIcon}
      </View>
      <Text style={[styles.content, contentStyle]}>{content}</Text>
    </View>
  );
};

RowInfo.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  imageIcon: PropTypes.element,
  contentStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  titleStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default RowInfo;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...FONTS.t14r,
    color: COLOR.textSecondary,
  },
  content: {
    ...FONTS.t16r,
    color: COLOR.white,
  },
});
