import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {FONTS, STRINGS, SIZES, COLOR, ICONS} from '../../constants';
import {useTranslation} from 'react-i18next';
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
const BackupOptionsView = ({style, supTitle, onPress = () => {}}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity onPress={() => onPress()}>
      <View style={{...styles.container, ...style}}>
        <View style={{justifyContent: 'space-evenly'}}>
          <Text style={{...FONTS.t12b, color: COLOR.textSecondary}}>
            {t(STRINGS.backup_options)}
          </Text>
          <Text style={{...FONTS.t14r, color: COLOR.textPrimary}}>
            {supTitle}
          </Text>
        </View>

        <Image
          source={ICONS.arrowDown}
          style={{height: SIZES.iconSize, width: SIZES.iconSize}}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};
export default BackupOptionsView;
