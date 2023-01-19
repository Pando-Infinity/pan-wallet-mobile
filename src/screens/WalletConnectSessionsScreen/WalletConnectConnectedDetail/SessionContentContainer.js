import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { STRINGS } from '../../../constants';
import { compactAddress } from 'utils/util';
import { RowInfo } from '../components';

const SessionContentContainer = ({
  nameWallet,
  address,
  connectedTime,
  linkDapp,
  network,
  ...otherProps
}) => {
  const { t: getLabel } = useTranslation();

  const addressContent = useMemo(() => {
    const addressFormat = compactAddress(address);
    return `${nameWallet} (${addressFormat})`;
  }, [nameWallet, address]);

  return (
    <View {...otherProps}>
      <RowInfo
        title={getLabel(STRINGS.connected)}
        content={connectedTime}
        style={{ marginTop: 46 }}
      />
      <RowInfo
        title={getLabel(STRINGS.connectedTo)}
        content={linkDapp}
        style={{ marginTop: 12 }}
      />
      <RowInfo
        title={getLabel(STRINGS.address)}
        content={addressContent}
        style={{ marginTop: 46 }}
      />
      <RowInfo
        title={getLabel(STRINGS.network)}
        content={network}
        style={{ marginTop: 12 }}
      />
    </View>
  );
};

SessionContentContainer.propTypes = {
  nameWallet: PropTypes.string,
  address: PropTypes.string,
  connectedTime: PropTypes.string,
  linkDapp: PropTypes.string,
  network: PropTypes.string,
};

export default SessionContentContainer;
