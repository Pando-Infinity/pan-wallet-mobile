import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { COLOR, FONTS, IMAGES, STRINGS } from '../../../constants';
import { useTranslation } from 'react-i18next';

const LoadingPopup = (
  img = IMAGES.clockLoading,
  title = STRINGS.create_password,
  hint = STRINGS.create_password_hint,
) => {
  const { t } = useTranslation();
  const initLoading = [true, false, false, false, false, false];
  const [loadingArray, setLoadingArray] = useState(initLoading);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = loadingArray.findIndex(element => element === true);
      if (currentIndex === 5) {
        setLoadingArray(initLoading);
      } else {
        setLoadingArray(
          loadingArray.map((_, index) => index === currentIndex + 1),
        );
      }
    }, 500);
    return () => clearInterval(interval);
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={img}
        style={{ height: 165, width: 131, marginBottom: 56 }}
      />
      <View
        style={{
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {loadingArray.map((item, index) => {
          return (
            <React.Fragment key={`loading-${index}`}>
              <View style={item ? style.big : style.small} />
            </React.Fragment>
          );
        })}
      </View>
      <Text style={style.textStyle}>{t(title)}</Text>
      <Text style={style.textStyle}>{t(hint)}</Text>
    </View>
  );
};

const style = StyleSheet.create({
  big: {
    width: 20,
    height: 20,
    backgroundColor: COLOR.shade6,
    marginRight: 12,
    borderRadius: 10,
  },
  small: {
    width: 12,
    height: 12,
    backgroundColor: COLOR.shade9,
    marginRight: 12,
    borderRadius: 6,
  },
  textStyle: {
    color: COLOR.textPrimary,
    ...FONTS.t14r,
  },
});

export default LoadingPopup;
