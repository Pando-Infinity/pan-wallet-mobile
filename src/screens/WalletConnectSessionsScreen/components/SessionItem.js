import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICONS, COLOR, FONTS } from '../../../constants';
import DappImage from './DappImage';
import { DEVICES_OPTION } from 'screens/WalletConnectSessionsScreen/helper';

const SessionItem = ({ data, onPressItem }) => {
  return (
    <View style={styles.root}>
      <TouchableOpacity onPress={onPressItem} style={styles.container}>
        <View style={styles.rowCenter}>
          <DappImage
            source={data?.imageDapp}
            name={data?.nameDapp}
            textProps={{ textContentProps: { style: { ...FONTS.t20b } } }}
          />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.dAppName} numberOfLines={1}>
              {data?.nameDapp}
            </Text>
            <Text style={styles.dAppLink}>{data?.linkDapp}</Text>
          </View>
        </View>
        <View style={styles.rowCenter}>
          <View
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {DEVICES_OPTION.desktop === data?.device ? (
              <Image source={ICONS.desktopDeviceIcon} />
            ) : (
              <Image source={ICONS.mobileDeviceIcon} />
            )}
          </View>
          <Image source={ICONS.rightButton} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

SessionItem.propTypes = {
  data: PropTypes.object,
  onPressItem: PropTypes.func,
};

export default SessionItem;

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginTop: 6,
    marginBottom: 6,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    ...FONTS.t16r,
    color: COLOR.white,
    marginBottom: 4,
  },
  container: {
    backgroundColor: COLOR.neutralSurface2,
    height: 56,
    borderRadius: 8,
    padding: 8,
    paddingRight: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dAppName: {
    color: COLOR.white,
    ...FONTS.t14b,
    maxWidth: 200,
  },
  dAppLink: {
    color: COLOR.white,
    ...FONTS.t12r,
  },
});
