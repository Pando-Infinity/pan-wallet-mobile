import React from 'react';
import {
  Container,
  HeaderLabel,
  RejectAndConfirmButton,
} from 'components/common';
import { useTranslation } from 'react-i18next';
import { STRINGS, CONSTANTS, COLOR, FONTS } from 'constants';
import { StyleSheet, Text, View } from 'react-native';
import { RowInfo } from './components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WalletConnector } from 'walletCore';
import { compactAddress } from 'utils/util';
import storage from 'databases/AsyncStorage';
import { SIZES } from '../../constants';

const SignatureRequest = () => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { peerMeta, payload, peerId, chainId } = route.params;

  const currentWalletName = storage.getString(CONSTANTS.firstWalletNameKey);

  const handleRejectRequest = () => {
    WalletConnector.rejectRequest(peerId, payload?.id, {
      code: 4001,
      message: 'User denied message signature',
    })
      .then(() => {
        WalletConnector.killSession(peerId);
      })
      .finally(() => {
        navigation.goBack();
      });
  };

  const handleConfirmRequest = () => {
    WalletConnector.approveSignRequest(
      peerId,
      payload?.id,
      payload?.params?.[0],
      chainId,
    ).finally(() => {
      navigation.goBack();
    });
  };

  return (
    <Container>
      <HeaderLabel label={getLabel(STRINGS.signatureRequest)} />
      <View style={styles.container}>
        <RowInfo
          title={getLabel(STRINGS.from)}
          content={`${currentWalletName} (${compactAddress(
            payload?.params?.[1],
          )})`}
        />
        <RowInfo
          title={getLabel(STRINGS.dApp)}
          content={peerMeta?.url}
          style={{ marginTop: 12, marginBottom: 24 }}
        />
        {Boolean(payload?.id) && (
          <View style={styles.signingWithNonceWrapper}>
            <Text style={styles.signingWithNonce}>
              {getLabel(STRINGS.signingWithOneTimeNonce, {
                dAppName: peerMeta?.name,
                nonce: payload?.id,
              })}
            </Text>
          </View>
        )}
      </View>

      <RejectAndConfirmButton
        onReject={handleRejectRequest}
        onConfirm={handleConfirmRequest}
        style={{ marginTop: 24 }}
        confirmLabel={getLabel(STRINGS.sign)}
      />
    </Container>
  );
};

SignatureRequest.propTypes = {};

export default SignatureRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 42,
  },
  signingWithNonceWrapper: {
    height: 64,
    backgroundColor: COLOR.simpleBackground,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  signingWithNonce: {
    color: COLOR.textSecondary,
    ...FONTS.t16r,
    width: SIZES.width * 0.8,
  },
});
