import React, { useEffect } from 'react';
import CustomButton from 'components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import { CONSTANTS, CONSTANT_EVENT_EMITTER, STRINGS } from '../../../constants';
import {
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import { parseWalletConnectUri } from '@walletconnect/utils';
import { walletConnectOnSessionRequest } from 'walletCore/WalletConnector';
import { connect } from 'react-redux';
import { WalletConnector } from 'walletCore';

const qrModule = NativeModules.QRCodeModule;

const { ScannerModule } = NativeModules;

const ConnectNewButton = () => {
  const { t: getLabel } = useTranslation();

  const onOpenScanQRCode = () => {
    if (Platform.OS === 'ios') {
      qrModule.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.connect);
    } else {
      ScannerModule.navigateToNative(CONSTANTS.walletConnect);
    }
  };

  const isValidUri = uri => {
    const result = parseWalletConnectUri(uri);
    return !(!result.handshakeTopic || !result.bridge || !result.key);
  };

  const handleCreateNewSession = uri => {
    uri = WalletConnector.getValidUriFromDeeplink(uri);
    if (Platform.OS === 'android') {
      ScannerModule.backPressedScannerActivity();
    }
    if (!isValidUri(uri)) return;
    WalletConnector.newSession(uri);
  };

  const iosListener = () => {
    qrModule.addListener(CONSTANTS.RNEvent_ReceiveCode);
    const event = new NativeEventEmitter(qrModule);
    event.addListener(CONSTANTS.RNEvent_ReceiveCode, body => {
      handleCreateNewSession(body.code);
    });
  };

  const androidListener = () => {
    DeviceEventEmitter.addListener(
      CONSTANT_EVENT_EMITTER.importExtensionData,
      data => {
        handleCreateNewSession(data.message);
      },
    );
  };

  useEffect(() => {
    Platform.OS === 'ios' ? iosListener() : androidListener();
    return () => {
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
    };
  });

  return (
    <CustomButton
      label={getLabel(STRINGS.connectNew)}
      width={220}
      height={48}
      styles={{ marginTop: 16 }}
      onPress={onOpenScanQRCode}
    />
  );
};

ConnectNewButton.propTypes = {};

export default connect(null, { walletConnectOnSessionRequest })(
  ConnectNewButton,
);
