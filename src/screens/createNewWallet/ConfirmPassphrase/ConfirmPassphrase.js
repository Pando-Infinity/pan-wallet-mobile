import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeModules,
  Platform,
} from 'react-native';
import { shuffle, isEmpty } from 'lodash';
import BackgroundLayout from '../../../components/Layout/BackgroundLayout';
import BackButton from '../../../components/CustomBackButton/CustomBackButton';
import {
  COLOR,
  FONTS,
  ICONS,
  SIZES,
  NUMBER,
  STRINGS,
  SCREEN_NAME,
} from '../../../constants';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import loading from './ConfirmPhraseLoading';
import { DAORepository } from '../../../databases';
import TokenName from '../../../constants/TokenName';

const { GenerateWalletAccountModule } = NativeModules;

const ConfirmPassPhrase = ({ route, navigation }) => {
  const { seedPhrase } = route.params;
  const randomPhrase = shuffle(seedPhrase.split(' '));
  const defaultAns = Array(NUMBER.defaultSeedPhraseLength).fill(' ');
  const { t } = useTranslation();
  const [confirmPhrases, setConfirmPhrases] = useState(defaultAns);
  const [enableError, setEnableError] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [confirmPhraseData, setConfirmPhrasesData] = useState(randomPhrase);
  const [statusGenerateBitcoin, setStatusGenerateBitcoin] = useState(false);
  const [statusGenerateEthereum, setStatusGenerateEthereum] = useState(false);
  const [statusGenerateSolana, setStatusGenerateSolana] = useState(false);

  const getAccountFromIOS = seedPhrase => {
    NativeModules.GeneratedAccount.generatedBitcoinAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountBitcoin(result).then(bitcoin => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.bitcoin}-${bitcoin._id}`,
          ).then(() => {
            setStatusGenerateBitcoin(true);
          });
        });
      },
    );

    NativeModules.GeneratedAccount.generatedEthereumAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountEthereum(result).then(ethereum => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.ethereum}-${ethereum._id}`,
          ).then(() => {
            setStatusGenerateEthereum(true);
          });
        });
      },
    );

    NativeModules.GeneratedAccount.generatedSolanaAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountSolana(result).then(solana => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.solana}-${solana._id}`,
          ).then(() => {
            setStatusGenerateSolana(true);
          });
        });
      },
    );
  };

  const getAccountFromAndroid = seedPhrase => {
    GenerateWalletAccountModule.generateBitcoinAccount(
      seedPhrase,
      bitcoinAccount => {
        const token = JSON.parse(bitcoinAccount);
        DAORepository.insertNewAccountBitcoin(token).then(bitcoin => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.bitcoin}-${bitcoin._id}`,
          ).then(() => {
            setStatusGenerateBitcoin(true);
          });
        });
      },
    );

    GenerateWalletAccountModule.generateEthereumAccount(
      seedPhrase,
      ethereumAccount => {
        const token = JSON.parse(ethereumAccount);
        DAORepository.insertNewAccountEthereum(token).then(ethereum => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.ethereum}-${ethereum._id}`,
          ).then(() => {
            setStatusGenerateEthereum(true);
          });
        });
      },
    );

    GenerateWalletAccountModule.generateSolanaAccount(
      seedPhrase,
      solanaAccount => {
        const token = JSON.parse(solanaAccount);
        DAORepository.insertNewAccountSolana(token).then(solana => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TokenName.solana}-${solana._id}`,
          ).then(() => {
            setStatusGenerateSolana(true);
          });
        });
      },
    );
  };

  const generateMultiWallet = () => {
    setIsPopup(true);
    setTimeout(() => {
      DAORepository.insertNewAccountWallet(
        seedPhrase,
        '',
        null,
        TokenName.multiChain,
      )
        .then(wallet => {
          DAORepository.insertNewAddressSchema(wallet._id, []).done();
        })
        .then(() => {
          Platform.OS === 'ios'
            ? getAccountFromIOS(seedPhrase)
            : getAccountFromAndroid(seedPhrase);
        });
    }, 1500);
  };

  const tapContinueButton = () => {
    const ans = confirmPhrases.join(' ');
    if (ans === seedPhrase) {
      generateMultiWallet();
    } else {
      setEnableError(true);
    }
  };

  const backButton = () => {
    return (
      <View
        style={{
          marginLeft: SIZES.simpleMargin,
          paddingVertical: SIZES.simpleSpace,
          marginTop: SIZES.marginStatusbar,
        }}>
        <BackButton
          onPress={() => {
            navigation.pop();
          }}
        />
      </View>
    );
  };

  const hintTitle = () => {
    return (
      <View
        style={{
          marginLeft: SIZES.simpleMargin,
          marginTop: SIZES.spaceWidthBackButton,
        }}>
        <Text style={style.title}>
          {t(STRINGS.confirm_your_secret_recovery_phrase)}
        </Text>
        <Text
          style={{
            color: COLOR.textSecondary,
            marginTop: SIZES.spaceWidthHeader,
            ...FONTS.t14r,
          }}>
          {t(STRINGS.confirm_hint)}
        </Text>
      </View>
    );
  };

  const inputItem = ({ item }) => {
    const Item = () => {
      if (item.item !== ' ') {
        return (
          <TouchableOpacity
            style={{
              height: 40,
              borderRadius: 30,
              backgroundColor: COLOR.gray4,
              borderWidth: 1,
              borderColor: COLOR.gray7,
            }}
            onPress={() => {
              setConfirmPhrases(
                confirmPhrases.map(value =>
                  value === item.item ? ' ' : value,
                ),
              );
              setConfirmPhrasesData(confirmPhraseData.concat([item.item]));
              setEnableError(false);
            }}
            activeOpacity={1}>
            <Text style={style.item}>{item.item}</Text>
          </TouchableOpacity>
        );
      } else {
        return (
          <View
            style={{
              height: 40,
            }}>
            <Text
              style={{
                paddingHorizontal: 8,
                paddingVertical: 8,
                ...FONTS.t16r,
                color: COLOR.gray7,
              }}>
              __________
            </Text>
          </View>
        );
      }
    };
    return (
      <View style={{ width: '45%', height: 52, flexDirection: 'row' }}>
        <Text style={style.item}>{item.index + 1}</Text>
        {Item()}
      </View>
    );
  };

  const confirmSRPView = () => {
    return (
      <View
        style={{
          borderColor: enableError
            ? COLOR.systemRedLight
            : COLOR.simpleBackground,
          borderWidth: 1,
          backgroundColor: COLOR.simpleBackground,
          marginTop: 33,
          height: 328,
        }}>
        <FlatList
          data={confirmPhrases.map((item, index) => {
            return { item: item, index: index };
          })}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          numColumns={2}
          renderItem={item => inputItem(item)}
          style={{
            width: SIZES.width,
            padding: SIZES.simpleMargin,
          }}
          scrollEnabled={false}
          nestedScrollEnabled
        />
      </View>
    );
  };

  const continueButton = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: SIZES.height - SIZES.simpleMargin * 2 - SIZES.buttonHeight,
          left: SIZES.simpleMargin,
          width: SIZES.width,
          height: SIZES.buttonHeight,
          display: !enableError ? 'flex' : 'none',
        }}>
        <CustomButton
          onPress={tapContinueButton}
          isDisable={false}
          width={SIZES.width - SIZES.simpleMargin * 2}
          height={SIZES.buttonHeight}
          icon={ICONS.arrowRight}
          label={t(STRINGS.continue)}
        />
      </View>
    );
  };

  const inputItemRender = (item, index) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          const emptyElement = element => element === ' ';
          const indexEmpty = confirmPhrases.findIndex(emptyElement);
          const data = confirmPhrases;
          data[indexEmpty] = item;
          setConfirmPhrases(data);
          const dataInput = confirmPhraseData.map(x => x);
          dataInput.splice(index, 1);
          setConfirmPhrasesData(dataInput);
        }}
        style={{
          height: 40,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 30,
          backgroundColor: COLOR.gray4,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: SIZES.simpleSpace,
          borderWidth: 1,
          borderColor: COLOR.gray7,
          marginBottom: SIZES.simpleSpace,
        }}>
        <Text
          style={{
            color: COLOR.textPrimary,
            ...FONTS.t16r,
          }}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const ListInput = () => {
    return (
      <View
        style={{
          marginTop: SIZES.simpleMargin * 2,
          marginLeft: SIZES.simpleMargin,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: SIZES.navigationBarAndroidHeight,
        }}>
        {confirmPhraseData.map((item, index) => {
          return inputItemRender(item, index);
        })}
      </View>
    );
  };

  const resetInputData = () => {
    return (
      <View
        style={{
          marginTop: SIZES.simpleMargin,
          marginLeft: SIZES.simpleMargin,
          flexDirection: 'row',
        }}>
        <Text style={{ color: COLOR.systemRedLight, ...FONTS.t12r }}>
          {t(STRINGS.error_seed_phrase_hint)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setEnableError(false);
            setConfirmPhrasesData(randomPhrase);
            setConfirmPhrases(defaultAns);
          }}>
          <Text
            style={{
              paddingHorizontal: SIZES.simpleSpace / 2,
              color: COLOR.white,
              ...FONTS.t12b,
            }}>
            {t(STRINGS.error_seed_phrase_btn)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    if (
      statusGenerateBitcoin &&
      statusGenerateEthereum &&
      statusGenerateSolana
    ) {
      setIsPopup(false);
      navigation.navigate(SCREEN_NAME.walletReadyScreen);
    }
  }, [
    navigation,
    statusGenerateBitcoin,
    statusGenerateEthereum,
    statusGenerateSolana,
  ]);

  const body = () => {
    return (
      <ScrollView>
        <Modal
          isVisible={isPopup}
          statusBarTranslucent={true}
          backdropOpacity={0.6}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropColor={COLOR.black}
          deviceHeight={SIZES.heightScreen}
          transparent={true}>
          {loading()}
        </Modal>
        {hintTitle()}
        {confirmSRPView()}
        {enableError && resetInputData()}
        {ListInput()}
      </ScrollView>
    );
  };

  return (
    <BackgroundLayout>
      <View style={{ flex: 1 }}>
        {backButton()}
        {body()}
        {isEmpty(confirmPhraseData) && continueButton()}
      </View>
    </BackgroundLayout>
  );
};

const style = StyleSheet.create({
  title: { color: COLOR.textPrimary, ...FONTS.t30b },
  item: {
    paddingHorizontal: SIZES.simpleMargin,
    paddingVertical: SIZES.simpleSpace,
    ...FONTS.t16r,
    color: COLOR.textPrimary,
  },
});

export default ConfirmPassPhrase;
