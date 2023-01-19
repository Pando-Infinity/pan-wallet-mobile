import React, { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  Text,
  Image,
  View,
  TouchableOpacity,
  Linking,
  Platform,
  NativeModules,
} from 'react-native';
import {
  IMAGES,
  COLOR,
  FONTS,
  SIZES,
  ICONS,
  STRINGS,
  PAN_CONNECT,
} from '../../constants';
import CustomButton from '../../components/CustomButton/CustomButton';
import BottomSheetBehavior from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import { DAORepository, storage } from '../../databases';
import { forEach, upperCase } from 'lodash';
import TokenName from '../../constants/TokenName';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { makeURL } from 'utils/util';
import PropTypes from 'prop-types';
import TokenSymbol from '../../constants/TokenSymbol';
import stringFormat from 'components/StringFormat/StringFormat';
import Constants from '../../constants/constants';

const ConfirmConnect = ({ navigation, route }) => {
  const { t } = useTranslation();

  const param = route.params;
  const fall = new Animated.Value(1);
  const dataPolicy = [t(STRINGS.connect_policy_1), t(STRINGS.connect_policy_2)];

  const sheetRef = useRef(null);
  const listAcc = useRef([]);
  const scheme = useRef('');

  const [walletName, setWalletName] = useState('');
  const [address, setAddress] = useState('');
  const [addressBtc, setAddressBtc] = useState('');
  const [addressEth, setAddressEth] = useState('');
  const [addressSol, setAddressSol] = useState('');
  const [walletID, setWalletID] = useState(0);
  const [logoValid, setLogoValid] = useState(true);

  const idCurrentWallet = storage.getNumber(Constants.rememberWalletIDKey) ?? 1;

  const symbolToTokenName = str => {
    return str === TokenSymbol.btc
      ? TokenName.bitcoin
      : str === TokenSymbol.eth
      ? TokenName.ethereum
      : str === TokenSymbol.bsc
      ? TokenName.smartChain
      : str === TokenSymbol.sol
      ? TokenName.solana
      : TokenName.multiChain;
  };

  const getIcon = () => {
    const chain = symbolToTokenName(param.chain);
    return chain === TokenName.bitcoin
      ? IMAGES.btc_icon
      : chain === TokenName.ethereum
      ? IMAGES.eth_icon
      : chain === TokenName.smartChain
      ? IMAGES.bsc_icon
      : chain === TokenName.solana
      ? IMAGES.sol_icon
      : IMAGES.multi_chain;
  };

  const compactAddress = val => {
    if (param.chain !== TokenSymbol.multi) {
      const length = val.length;
      return val.substring(0, 4) + '...' + val.substring(length - 4, length);
    }
  };

  const ConnectInfo = () => {
    const renderLogo = () => {
      if (!param || !param.logo) {
        return renderName();
      }
      return (
        <Image
          source={{ uri: param.logo }}
          onError={() => {
            setLogoValid(false);
          }}
          style={{
            width: SIZES.sizeAvatarDapp,
            height: SIZES.sizeAvatarDapp,
            borderRadius: SIZES.sizeAvatarDapp / 2,
            backgroundColor: COLOR.avatarDapp,
            marginTop: 34,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      );
    };

    const renderName = () => {
      return (
        <View
          style={{
            width: SIZES.sizeAvatarDapp,
            height: SIZES.sizeAvatarDapp,
            borderRadius: SIZES.sizeAvatarDapp / 2,
            backgroundColor: COLOR.avatarDapp,
            marginTop: 34,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ color: COLOR.white, ...FONTS.t30b }}>
            {param ? upperCase(param.name.slice(0, 1)) : ''}
          </Text>
        </View>
      );
    };

    return (
      <View
        style={{
          justifyContent: 'center',
          marginTop: SIZES.sizeAvatarDapp,
          alignItems: 'center',
        }}>
        <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
          {t(STRINGS.wallet_connect)}
        </Text>
        {logoValid && renderLogo()}
        {!logoValid && renderName()}
        <Text
          style={{
            color: COLOR.textSecondary,
            ...FONTS.t14r,
            marginTop: SIZES.simpleMargin,
          }}>
          {param ? param.url : ''}
        </Text>
        <Text
          style={{
            color: COLOR.white,
            ...FONTS.t20b,
            marginHorizontal: SIZES.simpleMargin,
            marginTop: SIZES.iconWidth,
            width: SIZES.width - SIZES.simpleMargin * 2,
            textAlign: 'left',
          }}>
          {stringFormat(`${t(STRINGS.dapp_want_connect)}`, [
            `${param ? param.name : ''}`,
          ])}
        </Text>
      </View>
    );
  };

  const WalletInfo = () => {
    return (
      <View
        style={{
          marginHorizontal: SIZES.simpleMargin,
          marginTop: SIZES.simpleMargin,
          height: SIZES.detailIconSize,
          backgroundColor: COLOR.neutralSurface2,
          flexDirection: 'row',
          borderRadius: SIZES.simpleMargin / 2,
        }}>
        <Image source={getIcon()} style={{ margin: SIZES.simpleMargin / 2 }} />
        <View
          style={{
            marginTop: SIZES.simpleMargin / 2,
            marginLeft: SIZES.simpleMargin,
            justifyContent: 'center',
          }}>
          <Text style={{ color: COLOR.white, ...FONTS.t14b }}>
            {walletName}
          </Text>
          <Text
            style={{
              color: COLOR.textSecondary,
              ...FONTS.t12r,
              marginTop: SIZES.simpleMargin / 4,
              display: param.chain === TokenSymbol.multi ? 'none' : 'flex',
            }}>
            {compactAddress(address)}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {listAcc.current.length > 1 && (
          <TouchableOpacity
            style={{ marginRight: SIZES.simpleMargin, alignSelf: 'center' }}
            onPress={() => sheetRef.current.snapTo(0)}
            activeOpacity={1}>
            <Text style={{ color: COLOR.actionLight1, ...FONTS.t14r }}>
              {t(STRINGS.change)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ListPolicy = () => {
    const renderItem = item => {
      return (
        <View
          key={item}
          style={{
            marginHorizontal: SIZES.simpleMargin,
            flexDirection: 'row',
            marginTop: 6,
          }}>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: COLOR.white,
              marginTop: 8.5,
            }}
          />
          <Text
            style={{
              color: COLOR.white,
              ...FONTS.t14r,
              marginLeft: SIZES.simpleMargin / 2,
            }}>
            {item}
          </Text>
        </View>
      );
    };
    return (
      <View style={{ marginHorizontal: SIZES.simpleMargin / 2, marginTop: 24 }}>
        {dataPolicy.map(item => renderItem(item))}
      </View>
    );
  };

  const BottomButtons = () => {
    const didTapReject = () => {
      const url = makeURL(
        scheme.current,
        PAN_CONNECT.response.connect,
        PAN_CONNECT.pan_response.user_reject,
      );
      handleOpenLinkToDApp(url);
    };

    const didTapConfirm = () => {
      const token = param.chain + `-${Date.now()}`;
      let addressChain;
      let networkName;
      switch (param.chain) {
        case TokenSymbol.multi: {
          addressChain = {
            btc: addressBtc,
            eth: addressEth,
            bsc: addressEth,
            sol: addressSol,
          };
          networkName = TokenName.multiChain.replace('Wallet', '').trim();
          break;
        }
        case TokenSymbol.btc: {
          addressChain = {
            btc: address,
          };
          networkName = TokenName.bitcoin;
          break;
        }
        case TokenSymbol.eth: {
          addressChain = {
            eth: address,
          };
          networkName = TokenName.ethereum;
          break;
        }
        case TokenSymbol.bsc: {
          addressChain = {
            bsc: address,
          };
          networkName = TokenName.smartChain;
          break;
        }
        case TokenSymbol.sol: {
          addressChain = {
            sol: address,
          };
          networkName = TokenName.solana;
          break;
        }
      }

      const url = makeURL(scheme.current, PAN_CONNECT.response.connect, {
        chain: param.chain,
        address: JSON.stringify(addressChain),
        pan_access_token: token,
        ...PAN_CONNECT.pan_response.success,
      });

      DAORepository.deleteSessionByDappBundleAndNetworkName(
        param.bundle,
        networkName,
      ).then(() => {
        DAORepository.createSessionConnect(
          `${token}`,
          param.scheme,
          param.bundle,
          param.name,
          param.logo ? param.logo : '',
          param.url,
          addressChain,
          walletID,
          networkName,
          new Date(),
        )
          .then(() => {
            handleOpenLinkToDApp(url);
          })
          .catch(err => {
            console.log(err);
          });
      });
    };

    const widthBtn = (SIZES.width - SIZES.simpleMargin * 3) / 2;
    return (
      <View
        style={{
          height: 58,
          marginHorizontal: SIZES.simpleMargin,
          marginBottom: 58,
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{
            width: widthBtn,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={didTapReject}>
          <Text style={{ color: COLOR.textPrimary, ...FONTS.t16b }}>
            {t(STRINGS.reject_btn)}
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={{ width: widthBtn, height: 58 }}>
          <CustomButton
            label={t(STRINGS.confirm_btn)}
            isDisable={
              param.chain === TokenSymbol.multi
                ? walletName === ''
                : address === ''
            }
            width={widthBtn}
            height={48}
            onPress={() => {
              if (
                param.chain === TokenSymbol.multi
                  ? walletName !== ''
                  : address !== ''
              ) {
                didTapConfirm();
              }
            }}
          />
        </View>
      </View>
    );
  };

  const BottomSheet = () => {
    const renderHeader = () => (
      <View
        style={{
          backgroundColor: COLOR.simpleBackground,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          width: '100%',
          position: 'relative',
          height: 50,
          borderBottomWidth: 1,
          borderColor: COLOR.gray5,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: COLOR.white,
            marginTop: SIZES.simpleMargin,
            ...FONTS.t16b,
          }}>
          {t(STRINGS.change_wallet)}
        </Text>
        <TouchableOpacity
          style={{
            position: 'absolute',
            end: 0,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            marginEnd: 20,
          }}
          onPress={() => sheetRef.current.snapTo(1)}>
          <Image source={ICONS.clear2} />
        </TouchableOpacity>
      </View>
    );

    const renderContent = () => {
      const renderItem = val => {
        return (
          <TouchableOpacity
            style={{
              height: 72,
              width: SIZES.width,
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderColor: COLOR.gray5,
            }}
            onPress={() => {
              if (param.chain === TokenSymbol.multi) {
                setAddressBtc(val.item.addressBtc);
                setAddressEth(val.item.addressEth);
                setAddressSol(val.item.addressSol);
              } else {
                setAddress(val.item.address);
              }
              setWalletName(val.item.name);
              setWalletID(val.item.id);
              sheetRef.current.snapTo(1);
            }}>
            <Image
              source={getIcon()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginTop: 16,
                marginLeft: 16,
              }}
            />
            <View
              style={{
                marginLeft: SIZES.simpleMargin,
                marginVertical: SIZES.simpleMargin,
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
                  {val.item.name}
                </Text>
                <Text
                  style={{
                    marginLeft: 6,
                    color: COLOR.textSecondary,
                    ...FONTS.t12r,
                    alignSelf: 'center',
                  }}>
                  {compactAddress(val.item.address)}
                </Text>
              </View>
              <Text
                style={{
                  color: COLOR.textSecondary,
                  marginTop: 4,
                  ...FONTS.t12r,
                }}>
                {val.item.type}
              </Text>
            </View>
          </TouchableOpacity>
        );
      };

      return (
        <View style={{ backgroundColor: COLOR.simpleBackground, height: 278 }}>
          <FlatList data={listAcc.current} renderItem={renderItem} />
        </View>
      );
    };
    return (
      <BottomSheetBehavior
        ref={sheetRef}
        snapPoints={[328, 0]}
        initialSnap={1}
        callbackNode={fall}
        enabledHeaderGestureInteraction={true}
        enabledGestureInteraction={true}
        enabledContentGestureInteraction={true}
        renderHeader={renderHeader}
        renderContent={renderContent}
      />
    );
  };

  const handleOpenLinkToDApp = url => {
    if (Platform.OS === 'android') {
      NativeModules.ConnectWalletModule.openLinkToDApp(url);
      navigation.pop();
    } else {
      Linking.openURL(url)
        .catch(error => console.error(error))
        .finally(() => navigation.pop());
    }
  };

  useEffect(() => {
    scheme.current = param.scheme;
    const chain = symbolToTokenName(param.chain);
    if (chain === TokenName.multiChain) {
      DAORepository.getAllWallet()
        .then(wallet => {
          wallet.forEach(async item => {
            if (item.chain === chain) {
              const wl = {};
              wl.type = item.chain;
              wl.name = item.name;
              wl.id = item._id;

              const listAddressOfWallet =
                await DAORepository.getListAddressTokenByWalletId(item._id);

              for (const idAddress of listAddressOfWallet) {
                const chainType = idAddress.split('-')[0];
                const id = idAddress.split('-')[1];
                switch (chainType) {
                  case TokenName.bitcoin: {
                    await DAORepository.getBitcoinById(parseInt(id, 10)).then(
                      result => {
                        wl.addressBtc = result.address;
                      },
                    );
                    break;
                  }

                  case TokenName.ethereum:
                  case TokenName.smartChain: {
                    await DAORepository.getEthereumById(parseInt(id, 10)).then(
                      result => {
                        wl.addressEth = result.address;
                      },
                    );

                    break;
                  }

                  case TokenName.solana: {
                    await DAORepository.getSolanaById(parseInt(id, 10)).then(
                      result => {
                        wl.addressSol = result.address;
                      },
                    );
                    break;
                  }
                }
              }

              listAcc.current.push(wl);
            }
          });
        })
        .finally(() => {
          setTimeout(() => {
            if (listAcc.current.length === 0) {
              const url = makeURL(
                scheme.current,
                PAN_CONNECT.response.connect,
                PAN_CONNECT.pan_response.no_account_support,
              );
              handleOpenLinkToDApp(url);
            } else {
              const currentWallet = listAcc.current.find(
                item => item.id === idCurrentWallet,
              );
              setWalletName(currentWallet.name);
              setWalletID(currentWallet.id);
              setAddressBtc(currentWallet.addressBtc);
              setAddressEth(currentWallet.addressEth);
              setAddressSol(currentWallet.addressSol);
            }
          }, 1000);
        });
    } else {
      DAORepository.getWalletByID(idCurrentWallet)
        .then(async item => {
          if (item.chain === TokenName.multiChain || item.chain === chain) {
            const wl = {};
            wl.type =
              item.chain === chain ? item.chain + ' Wallet' : item.chain;
            wl.name = item.name;
            wl.id = item._id;
            try {
              const list = await DAORepository.getListAddressTokenByWalletId(
                item._id,
              );
              forEach(list, async item2 => {
                const arr = item2.split('-');
                const block =
                  chain === TokenName.smartChain ? TokenName.ethereum : chain;
                if (arr[0] === chain || arr[0] === block) {
                  let obj = {};
                  switch (chain) {
                    case TokenName.ethereum:
                    case TokenName.smartChain:
                      obj = await DAORepository.getEthereumById(
                        parseInt(arr[1], 10),
                      );
                      break;
                    case TokenName.bitcoin:
                      obj = await DAORepository.getBitcoinById(
                        parseInt(arr[1], 10),
                      );
                      break;
                    case TokenName.solana:
                      obj = await DAORepository.getSolanaById(
                        parseInt(arr[1], 10),
                      );
                      break;
                    default:
                      break;
                  }
                  wl.address = obj.address;
                  listAcc.current.push(wl);
                }
              });
            } catch (error) {
              console.error(error);
            }
          }
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          setTimeout(() => {
            if (listAcc.current.length === 0) {
              const url = makeURL(
                scheme.current,
                PAN_CONNECT.response.connect,
                PAN_CONNECT.pan_response.no_account_support,
              );
              handleOpenLinkToDApp(url);
            } else {
              const currentWallet = listAcc.current.find(
                item => item.id === idCurrentWallet,
              );
              setWalletName(currentWallet.name);
              setAddress(currentWallet.address);
              setWalletID(currentWallet.id);
            }
          }, 1000);
        });
    }
  }, []);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      resizeMode="cover"
      style={{
        flex: 1,
      }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: Animated.add(0.4, Animated.multiply(fall, 1.0)),
        }}>
        {ConnectInfo()}
        {WalletInfo()}
        {ListPolicy()}
        <View style={{ flex: 1 }} />
        {BottomButtons()}
      </Animated.View>
      {BottomSheet()}
    </ImageBackground>
  );
};

ConfirmConnect.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

export default ConfirmConnect;
