import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, FONTS, ICONS, SIZES, STRINGS } from '../../constants';

export const RenderSearchBar = ({
  t,
  isFocus,
  onFocus = () => {},
  onBlur = () => {},
  query,
  onChangeText = () => {},
  clearButtonOnPress = () => {},
  cancelButtonOnPress = () => {},
  defaultValue,
  placeholder,
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={{
          width: query !== '' ? SIZES.width * 0.75 : '100%',
          borderRadius: SIZES.radius,
          height: 48,
          marginVertical: 10,
          padding: isFocus ? 1 : 0,
        }}>
        <View
          style={{
            backgroundColor: COLOR.simpleBackground,
            height: '100%',
            borderRadius: SIZES.radius,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}>
          <Image
            source={ICONS.search}
            style={{ height: SIZES.iconSize, width: SIZES.iconSize }}
            resizeMode="cover"
          />
          <TextInput
            autoFocus={false}
            style={{
              height: '100%',
              color: COLOR.textPrimary,
              marginLeft: 8,
              paddingHorizontal: 12,
              width: '75%',
              borderRadius: SIZES.radius,
              backgroundColor: COLOR.simpleBackground,
            }}
            placeholder={placeholder ?? t(STRINGS.enter_token_name)}
            placeholderTextColor={COLOR.textPlaceholder}
            onFocus={onFocus}
            onBlur={onBlur}
            value={
              isFocus || query ? query : defaultValue ?? t(STRINGS.search_token)
            }
            onChangeText={onChangeText}
          />
          {query !== '' ? (
            <TouchableOpacity onPress={() => clearButtonOnPress()}>
              <Image
                source={ICONS.clear}
                style={{ height: SIZES.iconHeight, width: SIZES.iconWidth }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>
      {query !== '' ? (
        <TouchableOpacity
          style={{ marginHorizontal: 8 }}
          onPress={() => cancelButtonOnPress()}>
          <Text style={{ ...FONTS.t14r, color: COLOR.white }}>
            {t(STRINGS.cancelText)}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
