import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import {FONTS, SIZES, COLOR, IMAGES, ICONS, STRINGS} from '../../../constants';
import {useTranslation} from 'react-i18next';
import CustomButton from '../../../components/CustomButton/CustomButton';
import QRCode from 'react-native-qrcode-svg';
import {compactAddress, copyTextToClipboard} from '../../../utils/util';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  body: {
    flex: 8,
    justifyContent: 'center',
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
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ViewAddressQRCode = ({route, navigation}) => {
  const {t} = useTranslation();

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
    <View style={{flex: 1}}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{flex: 1}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>
            <Text style={{...FONTS.t16b, color: COLOR.white}}>
              {t(STRINGS.view_address_qrcode)}
            </Text>
            <Text />
          </View>
          <Text
            style={{
              ...FONTS.t14r,
              color: COLOR.textSecondary,
              height: 45,
              marginTop: 34,
            }}>
            {t(STRINGS.qrcode_consists)}
          </Text>
          <View style={styles.body}>
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
              <Text style={{...FONTS.t14r, color: COLOR.white}}>
                {compactAddress(route.params.address)}
              </Text>
              <Image
                source={ICONS.copy}
                resizeMode="cover"
                style={{marginLeft: 8, width: 16, height: 16}}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <CustomButton
              height={SIZES.buttonHeight}
              width="100%"
              label={t(STRINGS.share_qrcode)}
              onPress={() => shareAddress(route.params.address)}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default ViewAddressQRCode;
