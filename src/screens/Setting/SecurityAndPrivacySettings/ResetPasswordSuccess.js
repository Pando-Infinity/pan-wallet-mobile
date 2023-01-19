import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLOR, FONTS, IMAGES, SCREEN_NAME, STRINGS } from 'constants';
import { useNavigation } from '@react-navigation/native';
import { Container } from 'components/common';

const ResetPasswordSuccess = () => {
  const { t: getLabel } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate(SCREEN_NAME.securityAndPrivacyScreen);
    }, 2000);
  }, [navigation]);

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={IMAGES.deleteSuccess} resizeMode="cover" />
        <Text style={{ ...FONTS.t20b, color: COLOR.textPrimary }}>
          {getLabel(STRINGS.reset_password_success)}
        </Text>
      </View>
    </Container>
  );
};
export default ResetPasswordSuccess;
