import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {COLOR, FONTS, IMAGES, SIZES, TABLE_NAME} from '../../constants';
import {DAORepository} from '../../databases';

const Setting = () => {
  var [dapps, setDapps] = useState([]);

  useEffect(() => {
    DAORepository.getAllData(TABLE_NAME.session_connect).then(res => {
      setDapps(res);
    });
  });

  const compactAddress = val => {
    const length = val.length;
    return val.substring(0, 4) + '...' + val.substring(length - 4, length);
  };

  const getImageSource = chain => {
    if (chain === 'btc') {
      return IMAGES.btc_icon;
    }
    if (chain === 'bsc') {
      return IMAGES.bsc_icon;
    }
    if (chain === 'eth') {
      return IMAGES.eth_icon;
    }
    return IMAGES.sol_icon;
  };

  const handleDisconnect = bundle => {
    DAORepository.deleteSessionByDappBundle(bundle);
  };

  return (
    <ImageBackground source={IMAGES.homeBackGround}>
      <Text
        style={{
          alignSelf: 'center',
          marginTop: 60,
          color: COLOR.white,
          ...FONTS.t30b,
        }}>
        List Dapp Connect
      </Text>

      {dapps.map(item => {
        return (
          <View
            key={item._id}
            style={{flex: 1, padding: SIZES.simpleMargin, marginTop: 50}}>
            <View
              style={{
                height: 60,
                flexDirection: 'row',
                backgroundColor: COLOR.actionDisabled,
              }}>
              <Image
                source={getImageSource(item._id.split('-')[0])}
                style={{width: 40, height: 40, margin: 10}}
              />
              <View style={{marginTop: 10}}>
                <Text
                  style={{
                    color: COLOR.white,
                    ...FONTS.t14r,
                  }}>{`Name : ${item.dapp_name}`}</Text>
                <Text style={{color: COLOR.white, ...FONTS.t14r}}>
                  {`Address : ${compactAddress(item.address)}`}
                </Text>
                <View style={{flex: 1}} />
              </View>
              <View style={{flex: 1}} />
              <TouchableOpacity
                style={{justifyContent: 'center', marginRight: 10}}
                onPress={() => handleDisconnect(item.bundle)}>
                <Text style={{...FONTS.t14r, color: 'red'}}>disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ImageBackground>
  );
};

export default Setting;
