import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, View } from 'react-native';
import { DEVICES_OPTION } from 'screens/WalletConnectSessionsScreen/helper';
import { COLOR, FONTS, ICONS } from '../../../constants';

const DappName = ({ name, device }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: COLOR.white, marginRight: 14, ...FONTS.t16b }}>
        {name}
      </Text>
      <View style={{ position: 'absolute', right: -14 }}>
        {DEVICES_OPTION.desktop === device ? (
          <Image source={ICONS.desktopDeviceIcon} />
        ) : (
          <Image source={ICONS.mobileDeviceIcon} />
        )}
      </View>
    </View>
  );
};

DappName.propTypes = {
  name: PropTypes.string,
  device: PropTypes.oneOf(Object.values(DEVICES_OPTION)),
};

export default DappName;
