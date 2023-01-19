import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import { COLOR, FONTS, ICONS, SIZES, STRINGS } from '../../constants';
import { useTranslation } from 'react-i18next';

const BackButton = ({ onPress = () => {}, style, isHiddenLabel }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        ...style,
      }}>
      <Image
        style={{
          width: SIZES.iconSize,
          height: SIZES.iconSize,
        }}
        source={ICONS.backButton}
      />
      {!isHiddenLabel && (
        <Text style={{ color: COLOR.white, ...FONTS.t14r }}>
          {t(STRINGS.back)}
        </Text>
      )}
    </TouchableOpacity>
  );
};
export default BackButton;
