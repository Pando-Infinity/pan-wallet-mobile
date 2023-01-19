import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  NativeEventEmitter,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  COLOR,
  CONSTANT_EVENT_EMITTER,
  CONSTANTS,
  FONTS,
  ICONS,
  IMAGES,
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TOKEN_NAME,
} from '../../constants';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import CustomBackButton from '../../components/CustomBackButton/CustomBackButton';
import { WalletCore, Bitcoin, Ethereum, Solana } from '../../walletCore';
import stringFormat from '../../components/StringFormat/StringFormat';
import { DAORepository } from '../../databases';
import Modal from 'react-native-modal';
import ButtonImportBySeedPhrasePrivateKey from './compomentImportWallet/ButtonImportBySeedPhrasePrivateKey';
import TextInputSeedPhrase from './compomentImportWallet/TextInputSeedPhrase';
import TextInputPrivateKey from './compomentImportWallet/TextInputPrivateKey';
import TextInputWalletName from './compomentImportWallet/TextInputWalletName';
import ButtonImportWallet from './compomentImportWallet/ButtonImportWallet';
import Loading from '../../components/Loading/Loading';
import PropTypes from 'prop-types';
import { format } from 'react-string-format';

const ImportWalletMultiChainOrSignChainScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { tokenIcon, tokenName, privateKeyLength, isMultiChain } = route.params;

  const scrollViewRef = useRef();
  const requestQRCodeRef = useRef(false);

  const [isDisplaySecretPhrase, setIsDisplaySecretPhrase] = useState(true);
  const [isDisplayPrivateKey, setIsDisplayPrivateKey] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [isSeedPhraseEnoughWord, setIsSeedPhraseEnoughWord] = useState(false);
  const [isSeedPhraseError, setIsSeedPhraseError] = useState(false);
  const [isSeedPhrasePadding, setIsSeedPhrasePadding] = useState(false);
  const [isSeedPhraseInvalid, setIsSeedPhraseInvalid] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isPrivateKeyPadding, setIsPrivateKeyPadding] = useState(false);
  const [isPrivateKeyError, setIsPrivateKeyError] = useState(false);
  const [isPrivateKeyEnoughWord, setIsPrivateKeyEnoughWord] = useState(false);
  const [isPrivateKeyInvalid, setIsPrivateKeyInvalid] = useState(false);
  const [isWalletNameEnoughCharacter, setIsWalletNameEnoughCharacter] =
    useState(false);
  const [walletName, setWalletName] = useState('');
  const [isVisible, setVisible] = useState(false);
  const [dataScanner, setDataScanner] = useState('');
  const [isScanner, setIsScanner] = useState(false);
  const [isGenerateBitcoin, setIsGenerateBitcoin] = useState(false);
  const [isGenerateEthereum, setIsGenerateEthereum] = useState(false);
  const [isGenerateSolana, setIsGenerateSolana] = useState(false);

  const checkLengthQrcode = code => {
    resetStateIsError();
    if (isDisplaySecretPhrase) {
      checkLengthSeedPhrase(code);
    } else {
      checkLengthPrivateKey(code);
    }
  };

  const checkLengthSeedPhrase = text => {
    const stringArr = text.split(' ').filter(word => word !== '');
    let isError;
    for (let i = 0; i < lengthSeedPhraseArray.length; i++) {
      if (stringArr.length === lengthSeedPhraseArray[i]) {
        setIsSeedPhraseError(false);
        setIsSeedPhraseEnoughWord(true);
        isError = true;
        break;
      } else if (text !== '') {
        isError = false;
        setIsSeedPhraseError(true);
      } else {
        isError = false;
        setIsSeedPhraseError(false);
        setIsSeedPhraseEnoughWord(false);
      }
    }
    if (isError) {
      checkValid(text);
    }
  };

  const checkLengthPrivateKey = text => {
    if (tokenName === TOKEN_NAME.solana) {
      if (privateKeyLength.includes(text.length)) {
        setIsPrivateKeyError(false);
        setIsPrivateKeyEnoughWord(true);
        checkValid(text);
      } else if (text !== '') {
        setIsPrivateKeyError(true);
      } else {
        setIsPrivateKeyError(false);
        setIsPrivateKeyEnoughWord(false);
      }
    } else {
      if (text.length === privateKeyLength) {
        setIsPrivateKeyError(false);
        setIsPrivateKeyEnoughWord(true);
        checkValid(text);
      } else if (text !== '') {
        setIsPrivateKeyError(true);
      } else {
        setIsPrivateKeyError(false);
        setIsPrivateKeyEnoughWord(false);
      }
    }
  };

  const getStringLengthSeedPhrase = () => {
    let string = '';
    for (let i = 0; i < lengthSeedPhraseArray.length; i++) {
      if (i !== lengthSeedPhraseArray.length - 1) {
        string = string + lengthSeedPhraseArray[i] + ', ';
      } else {
        string =
          string +
          `${t(STRINGS.or)} ` +
          lengthSeedPhraseArray[i] +
          t(STRINGS.words);
      }
    }
    return stringFormat(`${t(STRINGS.secret_recovery_phrase_contains)}`, [
      `${string}`,
    ]);
  };

  //qr scanner

  const showQRScan = () => {
    if (!requestQRCodeRef.current) {
      requestQRCodeRef.current = true;
      Keyboard.dismiss();
      if (Platform.OS === 'ios') {
        qrModule.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.mnemonic);
      } else {
        ScannerModule.navigateToNative(CONSTANTS.importExistingWallet);
      }
      requestQRCodeRef.current = false;
    }
  };

  const iosListener = useCallback(() => {
    qrModule.addListener(CONSTANTS.RNEvent_ReceiveCode);
    const event = new NativeEventEmitter(qrModule);
    event.addListener(CONSTANTS.RNEvent_ReceiveCode, body => {
      setDataScanner(body.code);
      setIsScanner(true);
      checkLengthQrcode(body.code);
    });
  }, [isDisplaySecretPhrase]);

  const androidListener = useCallback(() => {
    DeviceEventEmitter.addListener(CONSTANT_EVENT_EMITTER.seedPhrase, data => {
      setDataScanner(data.message);
      setIsScanner(true);
      checkLengthQrcode(data.message);
    });
  }, [isDisplaySecretPhrase]);

  const generateAddressMultiChain = (keyEncrypt, name) => {
    if (Platform.OS === 'ios') {
      generateAddressMultiChainForIos(keyEncrypt, name);
    } else {
      generateAddressMultiChainForAndroid(keyEncrypt, name);
    }
  };

  //generate address for ios

  const generateAddressMultiChainForIos = (keyEncrypt, name) => {
    generateBitcoinUsingSeedPhraseForIOS(keyEncrypt);

    generateEthereumUsingSeedPhraseForIOS(keyEncrypt, name);

    generateSolanaUsingSeedPhraseForIOS(keyEncrypt);
  };

  const generateBitcoinUsingSeedPhraseForIOS = () => {
    NativeModules.GeneratedAccount.generatedBitcoinAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountBitcoin(result).then(bitcoin => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TOKEN_NAME.bitcoin}-${bitcoin._id}`,
          ).then(() => {
            setIsGenerateBitcoin(true);
          });
        });
      },
    );
  };

  const generateEthereumUsingSeedPhraseForIOS = name => {
    NativeModules.GeneratedAccount.generatedEthereumAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountEthereum(result).then(ethereum => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${name}-${ethereum._id}`,
          ).then(() => {
            setIsGenerateEthereum(true);
          });
        });
      },
    );
  };

  const generateSolanaUsingSeedPhraseForIOS = () => {
    NativeModules.GeneratedAccount.generatedSolanaAccount(
      seedPhrase,
      result => {
        DAORepository.insertNewAccountSolana(result).then(solana => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TOKEN_NAME.solana}-${solana._id}`,
          ).then(() => {
            setIsGenerateSolana(true);
          });
        });
      },
    );
  };

  //generate address for android

  const generateAddressMultiChainForAndroid = (keyEncrypt, name) => {
    generateBitcoinUsingSeedPhraseForAndroid(keyEncrypt);

    generateEthereumUsingSeedPhraseForAndroid(keyEncrypt, name);

    generateSolanaUsingSeedPhraseForAndroid(keyEncrypt);
  };

  const generateBitcoinUsingSeedPhraseForAndroid = () => {
    GenerateWalletAccountModule.generateBitcoinAccount(
      seedPhrase,
      bitcoinAccount => {
        const token = JSON.parse(bitcoinAccount);
        DAORepository.insertNewAccountBitcoin(token).then(bitcoin => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TOKEN_NAME.bitcoin}-${bitcoin._id}`,
          ).then(() => {
            setIsGenerateBitcoin(true);
          });
        });
      },
    );
  };

  const generateEthereumUsingSeedPhraseForAndroid = name => {
    GenerateWalletAccountModule.generateEthereumAccount(
      seedPhrase,
      ethereumAccount => {
        const token = JSON.parse(ethereumAccount);
        DAORepository.insertNewAccountEthereum(token).then(ethereum => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${name ? name : TOKEN_NAME.ethereum}-${ethereum._id}`,
          ).then(() => {
            setIsGenerateEthereum(true);
          });
        });
      },
    );
  };

  const generateSolanaUsingSeedPhraseForAndroid = () => {
    GenerateWalletAccountModule.generateSolanaAccount(
      seedPhrase,
      solanaAccount => {
        const token = JSON.parse(solanaAccount);
        DAORepository.insertNewAccountSolana(token).then(solana => {
          DAORepository.updateIdTokenOfAddressSchemaLastRecord(
            `${TOKEN_NAME.solana}-${solana._id}`,
          ).then(() => {
            setIsGenerateSolana(true);
          });
        });
      },
    );
  };

  const generateAddressSignChain = keyEncrypt => {
    switch (tokenName) {
      case TOKEN_NAME.bitcoin: {
        if (Platform.OS === 'ios') {
          generateBitcoinUsingSeedPhraseForIOS(keyEncrypt);
        } else {
          generateBitcoinUsingSeedPhraseForAndroid(keyEncrypt);
        }
        break;
      }

      case TOKEN_NAME.smartChain:
      case TOKEN_NAME.ethereum: {
        if (Platform.OS === 'ios') {
          generateEthereumUsingSeedPhraseForIOS(keyEncrypt, tokenName);
        } else {
          generateEthereumUsingSeedPhraseForAndroid(keyEncrypt, tokenName);
        }
        break;
      }

      case TOKEN_NAME.solana: {
        if (Platform.OS === 'ios') {
          generateSolanaUsingSeedPhraseForIOS(keyEncrypt);
        } else {
          generateSolanaUsingSeedPhraseForAndroid(keyEncrypt);
        }
        break;
      }
    }
  };

  const checkValid = text => {
    if (isMultiChain || isDisplaySecretPhrase) {
      if (!WalletCore.checkValidate(text)) {
        setIsSeedPhraseInvalid(true);
        setIsSeedPhraseError(true);
      }
    } else {
      switch (tokenName) {
        case TOKEN_NAME.bitcoin: {
          if (!Bitcoin.checkValidPrivateKey(text)) {
            setIsPrivateKeyInvalid(true);
            setIsPrivateKeyError(true);
          }
          break;
        }

        case TOKEN_NAME.smartChain:
        case TOKEN_NAME.ethereum: {
          if (!Ethereum.checkValidPrivateKey(text)) {
            setIsPrivateKeyInvalid(true);
            setIsPrivateKeyError(true);
          }
          break;
        }

        case TOKEN_NAME.solana: {
          if (!Solana.checkValidPrivateKey(text)) {
            setIsPrivateKeyInvalid(true);
            setIsPrivateKeyError(true);
          }
          break;
        }
      }
    }
  };

  const handleImportWallet = () => {
    if (isMultiChain) {
      setVisible(true);
      setTimeout(() => {
        DAORepository.insertNewAccountWallet(
          seedPhrase,
          privateKey,
          walletName,
          tokenName,
        )
          .then(wallet => {
            DAORepository.insertNewAddressSchema(wallet._id, []).done();
          })
          .then(() => {
            generateAddressMultiChain(TOKEN_NAME.ethereum);
          });
      }, 1500);
    } else {
      if (isDisplaySecretPhrase) {
        setVisible(true);
        setTimeout(() => {
          DAORepository.insertNewAccountWallet(
            seedPhrase,
            '',
            walletName,
            tokenName,
          )
            .then(wallet => {
              DAORepository.insertNewAddressSchema(wallet._id, []).done();
            })
            .then(() => {
              generateAddressSignChain(tokenName);
            });
        }, 1500);
      } else {
        switch (tokenName) {
          case TOKEN_NAME.bitcoin: {
            setVisible(true);
            setTimeout(() => {
              DAORepository.insertNewAccountWallet(
                '',
                privateKey,
                walletName,
                tokenName,
              ).then(wallet => {
                Bitcoin.generateAddressFromPrivateKey(privateKey).then(
                  address => {
                    const account = {
                      address: address,
                      privateKey: privateKey,
                    };
                    DAORepository.insertNewAccountBitcoin(account).then(
                      bitcoinAccount => {
                        const addressList = [
                          `${TOKEN_NAME.bitcoin}-${bitcoinAccount._id}`,
                        ];
                        DAORepository.insertNewAddressSchema(
                          wallet._id,
                          addressList,
                        ).then(() => {
                          setVisible(false);
                          navigation.navigate(SCREEN_NAME.walletReadyScreen);
                        });
                      },
                    );
                  },
                );
              });
            }, 1500);
            break;
          }

          case TOKEN_NAME.smartChain:
          case TOKEN_NAME.ethereum: {
            setVisible(true);
            setTimeout(() => {
              DAORepository.insertNewAccountWallet(
                '',
                privateKey,
                walletName,
                tokenName,
              ).then(wallet => {
                Ethereum.generateAddressFromPrivateKey(privateKey).then(
                  address => {
                    const account = {
                      address: address,
                      privateKey: privateKey,
                    };
                    DAORepository.insertNewAccountEthereum(account).then(
                      ethereumAccount => {
                        const addressList = [
                          `${tokenName}-${ethereumAccount._id}`,
                        ];
                        DAORepository.insertNewAddressSchema(
                          wallet._id,
                          addressList,
                        ).then(() => {
                          setVisible(false);
                          navigation.navigate(SCREEN_NAME.walletReadyScreen);
                        });
                      },
                    );
                  },
                );
              });
            }, 1500);
            break;
          }

          case TOKEN_NAME.solana: {
            setVisible(true);
            setTimeout(() => {
              DAORepository.insertNewAccountWallet(
                '',
                privateKey,
                walletName,
                tokenName,
              ).then(wallet => {
                Solana.generateAddressFromPrivateKey(privateKey).then(
                  address => {
                    const account = {
                      address: address,
                      privateKey: privateKey,
                    };
                    DAORepository.insertNewAccountSolana(account).then(
                      solanaAccount => {
                        const addressList = [
                          `${TOKEN_NAME.solana}-${solanaAccount._id}`,
                        ];
                        DAORepository.insertNewAddressSchema(
                          wallet._id,
                          addressList,
                        ).then(() => {
                          setVisible(false);
                          navigation.navigate(SCREEN_NAME.walletReadyScreen);
                        });
                      },
                    );
                  },
                );
              });
            }, 1500);
            break;
          }
        }
      }
    }
  };

  const setTextImport = () => {
    return isDisplaySecretPhrase ? (
      <TextInputSeedPhrase
        isMultiChain={isMultiChain}
        stringLengthSeedPhrase={getStringLengthSeedPhrase()}
        isInvalid={isSeedPhraseInvalid}
        isError={isSeedPhraseError}
        isPadding={isSeedPhrasePadding}
        onFocus={() => {
          setIsSeedPhrasePadding(true);
          setIsSeedPhraseError(false);
          setIsSeedPhraseInvalid(false);
        }}
        onBlur={() => {
          setIsSeedPhrasePadding(false);
          checkLengthSeedPhrase(seedPhrase);
        }}
        getSeedPhrase={result => setSeedPhrase(result)}
        dataScanner={dataScanner}
        isScanner={isScanner}
        onChangeStatusScanner={() => {
          setIsScanner(false);
        }}
        autoFocus={false}
      />
    ) : (
      <TextInputPrivateKey
        privateKeyLength={privateKeyLength}
        isPadding={isPrivateKeyPadding}
        isError={isPrivateKeyError}
        isInvalid={isPrivateKeyInvalid}
        onFocus={() => {
          setIsPrivateKeyPadding(true);
          setIsPrivateKeyError(false);
          setIsPrivateKeyInvalid(false);
        }}
        onBlur={() => {
          setIsPrivateKeyPadding(false);
          checkLengthPrivateKey(privateKey);
        }}
        getPrivateKey={result => setPrivateKey(result)}
        dataScanner={dataScanner}
        isScanner={isScanner}
        onChangeStatusScanner={() => {
          setIsScanner(false);
        }}
        autoFocus={false}
      />
    );
  };

  const resetStateIsError = () => {
    setIsSeedPhraseError(false);
    setIsSeedPhraseEnoughWord(false);
    setIsSeedPhraseInvalid(false);

    setIsPrivateKeyError(false);
    setIsPrivateKeyEnoughWord(false);
    setIsPrivateKeyInvalid(false);
  };

  useEffect(() => {
    Platform.OS === 'ios' ? iosListener() : androidListener();

    return () => {
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
    };
  }, [iosListener, androidListener]);

  useEffect(() => {
    if (!isDisplaySecretPhrase) {
      setIsSeedPhraseEnoughWord(false);
      setIsSeedPhraseInvalid(false);
    }

    if (!isDisplayPrivateKey) {
      setIsPrivateKeyEnoughWord(false);
      setIsPrivateKeyInvalid(false);
    }
  }, [isDisplayPrivateKey, isDisplaySecretPhrase]);

  useEffect(() => {
    if (
      isMultiChain &&
      isGenerateBitcoin &&
      isGenerateEthereum &&
      isGenerateSolana
    ) {
      setVisible(false);
      navigation.navigate(SCREEN_NAME.walletReadyScreen);
    } else if (isGenerateBitcoin || isGenerateEthereum || isGenerateSolana) {
      setVisible(false);
      navigation.navigate(SCREEN_NAME.walletReadyScreen);
    }
  }, [isMultiChain, isGenerateBitcoin, isGenerateEthereum, isGenerateSolana]);

  return (
    <HideKeyboard>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={IMAGES.backgroundConfirmPassword}
          resizeMode="cover"
          blurRadius={4}
          style={styles.imageBackground}>
          <View style={styles.button_back}>
            <CustomBackButton onPress={() => navigation.goBack()} />
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'IOS' ? 'padding' : 'height'}
            keyboardVerticalOffset={20}>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() =>
                scrollViewRef.current.scrollToEnd({ animated: true })
              }
              keyboardShouldPersistTaps="handled">
              <Text style={[FONTS.t30b, styles.text_title]}>
                {t(STRINGS.import_your_wallet)}
              </Text>

              <View style={styles.token}>
                <Image source={tokenIcon} />

                <Text style={[FONTS.t16r, styles.token_name]}>
                  {tokenName === TOKEN_NAME.multiChain
                    ? t(STRINGS.multi_chain_wallet)
                    : format(`${t(STRINGS.type_wallet)}`, tokenName)}
                </Text>
              </View>

              {/*button select import using seed phrase or private key*/}
              <ButtonImportBySeedPhrasePrivateKey
                style={{ marginTop: 24 }}
                multiChain={isMultiChain}
                privateKeyLength={privateKeyLength}
                stringLengthSeedPhrase={getStringLengthSeedPhrase()}
                getDisplaySecretPhrase={status => {
                  setIsDisplaySecretPhrase(status);
                }}
                getDisplayPrivateKey={status => {
                  setIsDisplayPrivateKey(status);
                }}
                onPress={() => {
                  setDataScanner('');
                  setIsPrivateKeyPadding(false);
                  setIsSeedPhrasePadding(false);
                  resetStateIsError();
                }}
              />

              <View style={styles.button_scan_qr}>
                <TouchableOpacity onPress={showQRScan}>
                  <Image source={ICONS.qrCode} />
                </TouchableOpacity>
              </View>

              {/*text input*/}
              {setTextImport()}

              {/*text input wallet name*/}
              <TextInputWalletName
                getWalletNameEnoughCharacter={result =>
                  setIsWalletNameEnoughCharacter(result)
                }
                getWalletName={result => setWalletName(result)}
              />
            </ScrollView>
          </KeyboardAvoidingView>

          {/*button import*/}
          <ButtonImportWallet
            seedPhraseEnoughWord={
              isSeedPhraseEnoughWord &&
              isDisplaySecretPhrase &&
              !isSeedPhraseInvalid
            }
            privateKeyEnoughWord={
              isPrivateKeyEnoughWord &&
              isDisplayPrivateKey &&
              !isPrivateKeyInvalid
            }
            walletNameEnoughCharacter={isWalletNameEnoughCharacter}
            onPress={() => {
              handleImportWallet();
            }}
          />
        </ImageBackground>

        <Modal
          isVisible={isVisible}
          statusBarTranslucent={true}
          backdropOpacity={0.9}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropColor={COLOR.black}
          deviceHeight={SIZES.heightScreen}
          transparent={true}>
          <Loading
            imageSource={IMAGES.clockLoading}
            title={t(STRINGS.importing_your_wallet)}
            supTitle={t(STRINGS.this_shouldn_take_long)}
          />
        </Modal>
      </View>
    </HideKeyboard>
  );
};

const qrModule = NativeModules.QRCodeModule;
const { ScannerModule, GenerateWalletAccountModule } = NativeModules;
const lengthSeedPhraseArray = CONSTANTS.seedPhraseLength;

ImportWalletMultiChainOrSignChainScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },

  imageBackground: {
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
    flex: 1,
  },

  button_back: {
    alignItems: 'flex-start',
    marginTop: 56,
  },

  text_title: {
    color: COLOR.white,
    letterSpacing: -0.03,
    marginTop: 26,
  },

  token: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },

  token_name: {
    color: COLOR.white,
    marginStart: 12,
  },

  button_scan_qr: {
    marginTop: 16,
    alignItems: 'flex-end',
    paddingStart: 10,
    paddingEnd: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },
});

export default ImportWalletMultiChainOrSignChainScreen;
