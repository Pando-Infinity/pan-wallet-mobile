import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { COLOR, FONTS, ICONS, STRINGS } from '../../constants';

export const WarningView = ({ text, boldText }) => (
  <View style={styles.waring}>
    <View style={styles.waringContent}>
      <Image source={ICONS.waring} resizeMode="cover" />
      <Text
        style={{
          ...FONTS.t12r,
          color: COLOR.systemYellowLight,
          marginLeft: 15,
          marginRight: 28,
        }}>
        {text}
        <Text> </Text>
        <Text
          style={{
            ...FONTS.t12b,
            color: COLOR.systemYellowLight,
          }}>
          {boldText}
        </Text>
      </Text>
    </View>
  </View>
);
const styles = StyleSheet.create({
  waring: {
    marginTop: 24,
    width: '100%',
    backgroundColor: COLOR.systemYellowLight,
    paddingLeft: 4,
    borderRadius: 4,
  },

  waringContent: {
    flexDirection: 'row',
    backgroundColor: COLOR.systemYellow,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 11,
    alignItems: 'center',
  },
});
