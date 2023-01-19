import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  FONTS,
  STRINGS,
  SCREEN_NAME,
  COLOR,
  IMAGES,
  ICONS,
  TOKEN_NAME,
  IMPORT_TYPE,
} from '../../../constants';
import ContentLeftRightView from '../../../components/CustionView/ContentLeftRightView';
import BackupOptionsView from '../../../components/CustionView/BackupOptionsView';
import { useTranslation } from 'react-i18next';
import { DAORepository } from '../../../databases';
import { useDispatch, useSelector } from 'react-redux';
import ShowConfirmDeletingWallet from './ConfirmDeletingWallet';
import ChangeWalletName from './ChangeWalletName';
import { setVisibleChangeWalletName } from 'stores/reducer/isVisiableChangeWalletName';
import { setChangeWalletName } from 'stores/reducer/isChangeWalletNameSlice';
import { setShowResetPassWord } from 'stores/reducer/isShowResetPasswordSlice';
import { setDeleteThisWalletModal } from 'stores/reducer/deleteThisWalletModalSlice';
import { compactAddress, copyTextToClipboard } from 'utils/util';
import { CONSTANTS } from '../../../constants';
import { storage } from '../../../databases';
import PropTypes from 'prop-types';

const WalletDetail = ({ navigation, route }) => {
  const { t } = useTranslation();
  const disPatch = useDispatch();
  const currentWalletID = storage.getNumber(CONSTANTS.rememberWalletIDKey) ?? 1;

  const { isChangeWalletName } = useSelector(state => state.isChangeWalletName);

  const walletData = useRef([]);
  const [privateKeyData, setPrivateKey] = useState('');
  const [seedPhraseData, setSeedPhrase] = useState('');
  const [walletNameUI, setWalletName] = useState(route.params.name);

  const getWalletWithID = async () => {
    const wallet = await DAORepository.getAllWallet();
    walletData.current = wallet.filter(value => {
      return value._id === route.params.id;
    });
  };

  const showPrivateKey = () => {
    if (route.params.import_type === IMPORT_TYPE.privateKeyType) {
      setPrivateKey(route.params.privateKey);
    }
  };

  const showSeedPhrase = () => {
    if (route.params.import_type === IMPORT_TYPE.seedPhraseType) {
      setSeedPhrase(route.params.seedPhrase);
    }
  };

  const setupData = async () => {
    await getWalletWithID();
    showPrivateKey();
    showSeedPhrase();
  };

  const changeNameForWallet = () => {
    if (isChangeWalletName === true) {
      disPatch(setChangeWalletName(false));
      getWalletWithID().then(() => setWalletName(walletData.current[0].name));
    }
  };

  const renderChainName = chain => {
    switch (chain) {
      case TOKEN_NAME.multiChain:
        return t(STRINGS.multi_chain_wallet);
      case TOKEN_NAME.bitcoin:
        return t(STRINGS.bitcoin_wallet);
      case TOKEN_NAME.ethereum:
        return t(STRINGS.ethereum_wallet);
      case TOKEN_NAME.smartChain:
        return t(STRINGS.smartChain_wallet);
      case TOKEN_NAME.solana:
        return t(STRINGS.solana_wallet);
    }
  };

  useEffect(() => {
    changeNameForWallet();
    setupData().done();
    setTimeout(() => {
      setupData().done();
    }, 100);
  }, [isChangeWalletName, t]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>

            <View
              style={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
              <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
                {walletNameUI}
              </Text>
              <Text style={{ ...FONTS.t14r, color: COLOR.textSecondary }}>
                {renderChainName(route.params.chain)}
              </Text>
            </View>
            <Text />
          </View>

          <View style={styles.body}>
            <ContentLeftRightView
              style={{ marginTop: 16 }}
              label={walletNameUI}
              buttonText={t(STRINGS.edit)}
              onPress={() => disPatch(setVisibleChangeWalletName(true))}
            />

            {route.params.chain !== TOKEN_NAME.multiChain ? (
              <ContentLeftRightView
                style={{ marginTop: 16 }}
                label={compactAddress(route.params.address)}
                buttonText={t(STRINGS.copy)}
                onPress={() => copyTextToClipboard(t, route.params.address)}
              />
            ) : null}

            <BackupOptionsView
              style={{ marginTop: 40 }}
              supTitle={
                route.params.import_type === IMPORT_TYPE.seedPhraseType
                  ? t(STRINGS.reveal_Phrase)
                  : t(STRINGS.reveal_privateKey)
              }
              onPress={() => {
                disPatch(setShowResetPassWord(false));
                navigation.navigate(SCREEN_NAME.confirmPasswordScreen, {
                  screenName: SCREEN_NAME.walletDetail,
                  type: route.params.import_type,
                  seedPhrase: seedPhraseData,
                  privateKey: privateKeyData,
                });
              }}
            />

            <Text
              style={{
                ...FONTS.t12r,
                height: 50,
                marginTop: 16,
                color: COLOR.textSecondary,
                marginHorizontal: 16,
              }}>
              {t(STRINGS.you_have_lost_your_access)}
            </Text>

            {route.params.chain !== TOKEN_NAME.multiChain ? (
              <ContentLeftRightView
                style={{ marginTop: 40 }}
                label={t(STRINGS.address_qr_code)}
                buttonText={t(STRINGS.view)}
                onPress={() =>
                  navigation.navigate(SCREEN_NAME.viewAddressQRCode, {
                    address: route.params.address,
                  })
                }
              />
            ) : null}
          </View>

          <View style={styles.footer}>
            {currentWalletID !== route.params.id && (
              <TouchableOpacity
                onPress={() => disPatch(setDeleteThisWalletModal(true))}>
                <Text style={{ ...FONTS.t16b, color: COLOR.systemRedLight }}>
                  {t(STRINGS.delete_this_wallet)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>

      <ShowConfirmDeletingWallet
        navigation={navigation}
        walletID={route.params.id}
      />

      <ChangeWalletName idWallet={parseInt(route.params.id, 10)} />
    </View>
  );
};

WalletDetail.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
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
    marginTop: 16,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default WalletDetail;
