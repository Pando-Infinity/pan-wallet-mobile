import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {
  STRINGS,
  FONTS,
  COLOR,
  SCREEN_NAME,
  SIZES,
  TOKEN_SYMBOL,
  TABLE_NAME,
  TOKEN_NAME,
} from 'constants';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UploadIcon, DownloadIcon } from 'icons';
import { DAORepository } from 'databases';

const SendAndReceiveActions = ({ data, walletID, style, ...otherProps }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const handleWallet = wallet => {
    navigation.navigate(SCREEN_NAME.sendToken, {
      walletID: walletID.current,
      list: data,
      screen: route.screen,
      wallet: wallet,
    });
  };

  const onSend = () => {
    if (data.length === 1) {
      const token = data[0];
      let type = token.type;
      if (type === 'coin') {
        switch (token.asset_id) {
          case TOKEN_SYMBOL.btc.toUpperCase():
            type = 'BTC';
            break;
          case TOKEN_SYMBOL.bsc.toUpperCase():
            type = 'ERC20';
            break;
          case TOKEN_SYMBOL.eth.toUpperCase():
            type = 'BEP20';
            break;
          default:
            type = 'SPL';
            break;
        }
      }

      DAORepository.getAllData(TABLE_NAME.address_schema).then(val => {
        const walletData = val.filter(item => {
          return item.idAccountWallet === walletID.current;
        })[0].addressList;
        switch (type) {
          case 'ERC20':
          case 'BEP20':
            for (const element of walletData) {
              const [coin, id] = element.split('-');
              if (
                coin === TOKEN_NAME.ethereum ||
                coin === TOKEN_NAME.smartChain
              ) {
                DAORepository.getEthereumById(parseInt(id, 10)).then(
                  handleWallet,
                );
                return;
              }
            }
            break;
          case 'BTC':
            for (const element of walletData) {
              const [coin, id] = element.split('-');
              if (coin === TOKEN_NAME.bitcoin) {
                DAORepository.getBitcoinById(parseInt(id, 10)).then(
                  handleWallet,
                );
                return;
              }
            }
            break;
          case 'SPL':
            for (const element of walletData) {
              const [coin, id] = element.split('-');
              if (coin === TOKEN_NAME.solana) {
                DAORepository.getSolanaById(parseInt(id)).then(handleWallet);
                return;
              }
            }
            break;
        }
      });
    } else {
      navigation.navigate(SCREEN_NAME.sendToken, {
        walletID: walletID.current,
        list: data,
        screen: route.name,
      });
    }
  };

  const onReceive = () => {
    navigation.navigate(SCREEN_NAME.chooseTokenToReceive, {
      data: data,
    });
  };

  return (
    <View style={[styles.wrapper, style]} {...otherProps}>
      <ActionItem
        label={t(STRINGS.send)}
        icon={<UploadIcon />}
        onPress={onSend}
      />

      <ActionItem
        label={t(STRINGS.receive)}
        icon={<DownloadIcon />}
        onPress={onReceive}
        style={{ marginLeft: 56 }}
      />
    </View>
  );
};

const ActionItem = memo(({ label, style, icon, ...otherProps }) => {
  return (
    <TouchableOpacity style={[styles.item, style]} {...otherProps}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
});

ActionItem.displayName = 'ActionItem';

ActionItem.propTypes = {
  label: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  icon: PropTypes.node,
};

SendAndReceiveActions.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  data: PropTypes.array,
  walletID: PropTypes.object,
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 50,
    backgroundColor: 'rgba(205, 232, 255, 0.2)',
    boxShadow: '0px 4px 24px rgba(101, 182, 252, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.simpleSpace,
  },
  label: {
    ...FONTS.t14r,
    color: COLOR.white,
    marginTop: 6,
  },
});

export default SendAndReceiveActions;
