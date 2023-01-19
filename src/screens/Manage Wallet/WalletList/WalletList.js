import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  CONSTANTS,
  FONTS,
  ICONS,
  IMAGES,
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TOKEN_NAME,
} from '../../../constants';
import { storage } from '../../../databases';
import AddWallet from './AddWallet';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { compactAddress } from 'utils/util';
import { useDispatch, useSelector } from 'react-redux';
import { setShowResetPassWord } from 'stores/reducer/isShowResetPasswordSlice';
import PropTypes from 'prop-types';
import { format } from 'react-string-format';

const WalletList = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const listWallet = useSelector(state => state.dataListWallet.listWallet);
  const listAddress = useSelector(state => state.dataListWallet.listAddress);

  const bs = createRef();
  const allWalletData = useRef([]);
  const [multiChainWalletData, setMultiChainWalletData] = useState([]);
  const [otherWalletData, setOtherWalletData] = useState([]);

  const walletSections = [
    {
      id: '0',
      title:
        multiChainWalletData.length !== 0
          ? t(STRINGS.multi_chain_wallets)
          : null,
      data: multiChainWalletData,
    },
    {
      id: '1',
      title: otherWalletData.length !== 0 ? t(STRINGS.other_wallet) : null,
      data: otherWalletData,
    },
  ];

  const fall = new Animated.Value(1);
  const showLogo = item => {
    switch (item.chain) {
      case TOKEN_NAME.multiChain: {
        return IMAGES.multi_chain;
      }
      case TOKEN_NAME.bitcoin: {
        return IMAGES.btc_icon;
      }
      case TOKEN_NAME.ethereum: {
        return IMAGES.eth_icon;
      }
      case TOKEN_NAME.smartChain: {
        return IMAGES.bsc_icon;
      }
      case TOKEN_NAME.solana: {
        return IMAGES.sol_icon;
      }
    }
  };

  const getAllListWalletForDataBase = () => {
    const data = listWallet;
    const listData = listAddress;
    allWalletData.current = data.map((wallet, i) => {
      wallet.address = listData[i];
      return wallet;
    });
  };

  const getMultiChainWalletData = () => {
    const multiChain = allWalletData.current.filter(value => {
      return value.chain === TOKEN_NAME.multiChain;
    });
    setMultiChainWalletData(multiChain);
  };

  const getOtherWalletData = () => {
    const otherChain = allWalletData.current.filter(value => {
      return value.chain !== TOKEN_NAME.multiChain;
    });
    setOtherWalletData(otherChain);
  };

  const bidingDataToSection = () => {
    getAllListWalletForDataBase();
    getMultiChainWalletData();
    getOtherWalletData();
  };

  const renderHeaderSection = section => (
    <View style={styles.sectionHeader}>
      <Text style={{ ...FONTS.t14r, color: COLOR.textSecondary }}>
        {section.title}
      </Text>
    </View>
  );

  const renderViewContainSectionRow = item => {
    return (
      <View style={styles.token_list}>
        <View style={styles.tokenListImage}>
          <Image
            source={showLogo(item)}
            style={{
              width: SIZES.iconWidth,
              height: SIZES.iconHeight,
              left: 8,
            }}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.tokenListLabel, { width: '60%' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...FONTS.t14b, color: COLOR.white }}>
              {item.name}
            </Text>
            <Text
              style={{
                ...FONTS.t12r,
                color: COLOR.textSecondary,
                left: SIZES.height * 0.02,
              }}>
              {item.chain === TOKEN_NAME.multiChain
                ? ''
                : compactAddress(item.address)}
            </Text>
          </View>

          <Text
            style={{
              ...FONTS.t12r,
              color: COLOR.textSecondary,
              display: item.chain === TOKEN_NAME.multiChain ? 'none' : 'flex',
            }}>
            {item.chain === TOKEN_NAME.multiChain
              ? ''
              : format(`${t(STRINGS.type_wallet)}`, item.chain)}
          </Text>
        </View>

        <View style={styles.balanceView}>
          <Image
            source={ICONS.rightButton}
            style={{ height: 15, width: 7.5 }}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  const renderItem = item => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 12,
        }}
        onPress={() => {
          navigation.navigate(SCREEN_NAME.walletDetail, {
            id: item._id,
            name: item.name,
            chain: item.chain,
            address: item.address,
            import_type: item.importType,
            seedPhrase: item.seedPhrase,
            privateKey: item.privateKey,
          });
          storage.set(CONSTANTS.changeWalletScreenID, item._id);
        }}>
        {renderViewContainSectionRow(item)}
      </TouchableOpacity>
    );
  };

  const createWalletSectionList = () => (
    <SectionList
      sections={walletSections}
      style={styles.sectionContainer}
      renderSectionHeader={({ section }) => renderHeaderSection(section)}
      renderItem={({ item }) => renderItem(item)}
      stickySectionHeadersEnabled={false}
    />
  );

  useEffect(() => {
    bidingDataToSection();
  }, [listWallet]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <Animated.View
          style={{
            flex: 1,
            opacity: Animated.add(0.4, Animated.multiply(fall, 1.0)),
          }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>

            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {t(STRINGS.manage_wallet)}
            </Text>

            <TouchableOpacity
              onPress={() => {
                dispatch(setShowResetPassWord(false));
                bs.current.snapTo(0);
              }}>
              <Image
                source={ICONS.plus}
                resizeMode="cover"
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>{createWalletSectionList()}</View>
        </Animated.View>

        {AddWallet(navigation, bs, fall)}
      </ImageBackground>
    </View>
  );
};

WalletList.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  body: {
    flex: 9,
    justifyContent: 'flex-start',
  },
  sectionContainer: {},
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionRow: {
    height: 56,
    backgroundColor: COLOR.neutralSurface2,
  },
  token_list: {
    width: SIZES.width - 32,
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLOR.neutralSurface2,
  },
  tokenListImage: {
    width: SIZES.iconWidth,
    height: SIZES.iconHeight,
  },
  tokenListLabel: {
    marginLeft: SIZES.width * 0.05,
    justifyContent: 'space-evenly',
  },
  balanceView: {
    width: '30%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default WalletList;
