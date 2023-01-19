import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import CustomTextInput from 'components/inputs/CustomTextInput';
import {
  SIZES,
  STRINGS,
  FONTS,
  COLOR,
  ICONS,
  CONSTANTS,
  CONSTANT_EVENT_EMITTER,
} from 'constants';
import { useTranslation } from 'react-i18next';

const RecipientAddress = ({
  isInvalid,
  recipientAddress,
  setRecipientAddress,
  ...otherProps
}) => {
  const { t } = useTranslation();
  const { ScannerModule } = NativeModules;
  const qrCode = NativeModules.QRCodeModule;

  const handleScanner = () => {
    if (Platform.OS === 'ios') {
      qrCode.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.mnemonic);
    } else {
      ScannerModule.navigateToNative(CONSTANTS.importExistingWallet);
    }
  };

  useEffect(() => {
    const event = new NativeEventEmitter(qrCode);
    event.addListener(CONSTANT_EVENT_EMITTER.receiptCode, val => {
      setRecipientAddress(val.code);
    });
    DeviceEventEmitter.addListener(CONSTANT_EVENT_EMITTER.seedPhrase, data => {
      setRecipientAddress(data.message);
    });

    return () => {
      event.removeAllListeners(CONSTANT_EVENT_EMITTER.receiptCode);
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
    };
  }, [qrCode, setRecipientAddress]);

  return (
    <View {...otherProps}>
      <TouchableOpacity style={styles.qrCodeButton} onPress={handleScanner}>
        <Image source={ICONS.qrCode} />
      </TouchableOpacity>

      <CustomTextInput
        label={t(STRINGS.recipient_address)}
        multiline
        error={isInvalid}
        value={recipientAddress}
        onChangeText={setRecipientAddress}
      />
      {isInvalid && (
        <Text style={styles.errorMsg}>{t(STRINGS.invalid_address)}</Text>
      )}
    </View>
  );
};

RecipientAddress.propTypes = {
  isInvalid: PropTypes.bool,
  recipientAddress: PropTypes.string,
  setRecipientAddress: PropTypes.func,
};

const styles = StyleSheet.create({
  errorMsg: {
    marginTop: SIZES.simpleSpace,
    color: COLOR.systemRedLight,
    ...FONTS.t12r,
  },
  qrCodeButton: {
    width: SIZES.iconWidth,
    height: SIZES.iconHeight,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecipientAddress;
