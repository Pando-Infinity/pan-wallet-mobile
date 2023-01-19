import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { FONTS, SIZES, STRINGS, COLOR, IMAGES, ICONS } from '../../constants';
import { useTranslation } from 'react-i18next';
import { AvatarView } from 'components/CustionView/AvatarView';
import QRCode from 'react-native-qrcode-svg';
import { compactAddress, copyTextToClipboard } from 'utils/util';
import stringFormat from '../../components/StringFormat/StringFormat';
import CustomButton from '../../components/CustomButton/CustomButton';
import { HeaderLabel } from 'components/common';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReceiveDetail = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const shareAddress = async address => {
    try {
      const result = await Share.share({
        message: `${address}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 45 }}
        resizeMode="cover">
        <HeaderLabel
          label={stringFormat(t(STRINGS.receive_symbol), [
            `${route.params.symbol === 'BSC' ? 'BNB' : route.params.symbol}`,
          ])}
        />
        <View style={styles.body}>
          <View
            style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
            <AvatarView
              size={SIZES.detailIconSize}
              image={route.params.image}
            />
            <Text
              style={{ ...FONTS.t16r, color: COLOR.textPrimary, marginTop: 8 }}>
              {route.params.name}
            </Text>
            <Text
              style={{
                ...FONTS.t14r,
                color: COLOR.textSecondary,
                marginTop: 24,
              }}>
              {stringFormat(t(STRINGS.receive_note), [
                `${route.params.name}`,
                `${
                  route.params.symbol === 'BSC' ? 'BNB' : route.params.symbol
                }`,
              ])}
            </Text>
          </View>

          <View
            style={{ flex: 6, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.qrCode}>
              <QRCode
                value={route.params.address}
                backgroundColor="white"
                color="black"
                size={200}
              />
            </View>

            <TouchableOpacity
              onPress={() => copyTextToClipboard(t, route.params.address)}
              style={{
                marginTop: 24,
                paddingHorizontal: 55,
                backgroundColor: COLOR.stateDefault,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{ ...FONTS.t14r, color: COLOR.white }}>
                {compactAddress(route.params.address)}
              </Text>

              <Image
                source={ICONS.copy}
                resizeMode="cover"
                style={{ marginLeft: 8, width: 16, height: 16 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <CustomButton
            label={t(STRINGS.share_address)}
            height={48}
            width={163}
            onPress={() => shareAddress(route.params.address)}
          />
        </View>
      </ImageBackground>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  qrCode: {
    backgroundColor: COLOR.white,
    height: 220,
    width: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
export default ReceiveDetail;
