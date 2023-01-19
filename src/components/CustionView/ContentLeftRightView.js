import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {FONTS, STRINGS, SIZES, COLOR} from '../../constants';
const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: COLOR.neutralSurface2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
});
const ContentLeftRightView = ({
  style,
  label,
  buttonText,
  onPress = () => {},
}) => (
  <View style={{...styles.container, ...style}}>
    <Text style={{...FONTS.t14b, color: COLOR.white}}>{label}</Text>
    <TouchableOpacity onPress={() => onPress()}>
      <Text style={{...FONTS.t14r, color: COLOR.actionLink1}}>
        {buttonText}
      </Text>
    </TouchableOpacity>
  </View>
);
export default ContentLeftRightView;
