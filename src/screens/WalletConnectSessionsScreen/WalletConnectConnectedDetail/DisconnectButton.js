import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity } from 'react-native';
import { COLOR, FONTS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import { WalletConnector } from 'walletCore';
import { useNavigation } from '@react-navigation/native';
import { DAORepository } from 'databases/index';

const DisconnectButton = ({ id, bundle, networkName }) => {
  const { t: getLabel } = useTranslation();
  const navigation = useNavigation();

  const handleDisconnectSession = async () => {
    if (bundle) {
      await DAORepository.deleteSessionByDappBundleAndNetworkName(
        bundle,
        networkName,
      );
    } else {
      await WalletConnector.killSession(id);
    }
    navigation.goBack();
  };

  return (
    <TouchableOpacity
      style={{
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={handleDisconnectSession}>
      <Text style={{ color: COLOR.systemRedLight, ...FONTS.t16b }}>
        {getLabel(STRINGS.disconnect)}
      </Text>
    </TouchableOpacity>
  );
};

DisconnectButton.propTypes = {
  id: PropTypes.string,
  bundle: PropTypes.bool,
  networkName: PropTypes.string,
};

export default DisconnectButton;
