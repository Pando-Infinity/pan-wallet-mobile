import React from 'react';
import { View } from 'react-native';
import { Container, HeaderLabel } from 'components/common';
import { FONTS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import { DappImage } from '../components';
import { useRoute } from '@react-navigation/native';
import DappName from './DappName';
import DisconnectButton from './DisconnectButton';
import SessionContentContainer from './SessionContentContainer';

const WalletConnectConnectedDetail = props => {
  const { t: getLabel } = useTranslation();

  const { params = {} } = useRoute();

  return (
    <Container>
      <HeaderLabel label={getLabel(STRINGS.walletConnectConnected)} />
      <View style={{ alignItems: 'center', marginTop: 34 }}>
        <DappImage
          source={params.imageDapp}
          name={params.nameDapp}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            marginBottom: 12,
          }}
          textProps={{ textContentProps: { style: { ...FONTS.t30b } } }}
        />
        <DappName name={params.nameDapp} device={params.device} />
      </View>

      <View style={{ flex: 1, width: '100%' }}>
        <SessionContentContainer
          nameWallet={params.nameWallet}
          address={params.address}
          connectedTime={params.connectedTime}
          linkDapp={params.linkDapp}
          network={params.network}
        />
      </View>

      <DisconnectButton
        id={params.id}
        bundle={params.bundle}
        networkName={params.network}
      />
    </Container>
  );
};

WalletConnectConnectedDetail.propTypes = {};

export default WalletConnectConnectedDetail;
