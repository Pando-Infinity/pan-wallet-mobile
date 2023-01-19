import React, { useEffect } from 'react';
import {
  DeviceEventEmitter,
  Image,
  NativeModules,
  Platform,
  NativeEventEmitter,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import {
  COLOR,
  CONSTANT_EVENT_EMITTER,
  CONSTANTS,
  FONTS,
  IMAGES,
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from '../../constants';

const qrModule = NativeModules.QRCodeModule;

import { useTranslation } from 'react-i18next';
import CustomBackButton from '../../components/CustomBackButton/CustomBackButton';
import CustomButton from '../../components/CustomButton/CustomButton';
import { DAORepository } from '../../databases';
import { Bitcoin, Ethereum, Solana, WalletCore } from '../../walletCore';
import { Container } from 'components/common';
import { useNavigation } from '@react-navigation/native';

let statusScanner = false;

const { ScannerModule, GenerateWalletAccountModule } = NativeModules;

const GuidanceScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const event = new NativeEventEmitter(qrModule);

  useEffect(() => {
    Platform.OS === 'ios' ? iosListener() : androidListener();
    return () => {
      event.removeAllListeners(CONSTANT_EVENT_EMITTER.receiptAccount);
      DeviceEventEmitter.removeAllListeners(
        CONSTANT_EVENT_EMITTER.importExtensionData,
      );
    };
  }, [event]);

  //platform ios

  const iosListener = () => {
    eventHandleIOS();
  };

  const eventHandleIOS = () => {
    event.addListener(CONSTANT_EVENT_EMITTER.receiptAccount, body => {
      const listWallets = body.wallets;
      const listWalletSync = body.walletsSync;
      let check = true;
      listWalletSync.forEach(walletAccount => {
        switch (walletAccount.chain) {
          case TOKEN_SYMBOL.multi: {
            if (WalletCore.checkValidate(walletAccount.password)) {
              DAORepository.insertNewAccountWallet(
                walletAccount.password,
                '',
                walletAccount.name,
                TOKEN_NAME.multiChain,
              ).then(walletDB => {
                DAORepository.insertNewAddressSchema(walletDB._id, []).then(
                  val => {
                    listWallets.forEach(wallet => {
                      let privateKeyEth = '';
                      if (wallet.name === walletAccount.name) {
                        switch (wallet.chain) {
                          case TOKEN_SYMBOL.btc: {
                            DAORepository.insertNewAccountBitcoin({
                              address: wallet.address,
                              privateKey: wallet.privateKey,
                            }).then(result => {
                              DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
                                `${TOKEN_NAME.bitcoin}-${result._id}`,
                                val._id,
                              ).done();
                            });
                            break;
                          }

                          case TOKEN_SYMBOL.bsc:
                          case TOKEN_SYMBOL.eth: {
                            if (wallet.privateKey !== privateKeyEth) {
                              privateKeyEth = wallet.privateKey;
                              DAORepository.insertNewAccountEthereum({
                                address: wallet.address,
                                privateKey: wallet.privateKey,
                              }).then(result => {
                                DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
                                  `${TOKEN_NAME.ethereum}-${result._id}`,
                                  val._id,
                                ).done();
                              });
                            }
                            break;
                          }
                          case TOKEN_SYMBOL.sol: {
                            DAORepository.insertNewAccountSolana({
                              address: wallet.address,
                              privateKey: wallet.privateKey,
                            }).then(result => {
                              DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
                                `${TOKEN_NAME.solana}-${result._id}`,
                                val._id,
                              ).done();
                            });
                            break;
                          }
                        }
                      }
                    });
                  },
                );
              });
            } else {
              check = false;
            }
            break;
          }

          case TOKEN_SYMBOL.btc: {
            if (Bitcoin.checkValidPrivateKey(walletAccount.password)) {
              Bitcoin.generateAddressFromPrivateKey(
                walletAccount.password,
              ).then(bitcoinAddress => {
                DAORepository.insertNewAccountWallet(
                  '',
                  walletAccount.password,
                  walletAccount.name,
                  TOKEN_NAME.bitcoin,
                ).then(wallet => {
                  DAORepository.insertNewAccountBitcoin({
                    address: bitcoinAddress,
                    privateKey: wallet.privateKey,
                  }).then(bitcoin => {
                    DAORepository.insertNewAddressSchema(wallet._id, [
                      `${TOKEN_NAME.bitcoin}-${bitcoin._id}`,
                    ]).done();
                  });
                });
              });
            } else {
              check = false;
            }
            break;
          }

          case TOKEN_SYMBOL.bsc:
          case TOKEN_SYMBOL.eth: {
            const chain =
              walletAccount.chain === TOKEN_SYMBOL.eth
                ? TOKEN_NAME.ethereum
                : TOKEN_NAME.smartChain;

            if (Ethereum.checkValidPrivateKey(walletAccount.password)) {
              Ethereum.generateAddressFromPrivateKey(
                walletAccount.password,
              ).then(ethereumAddress => {
                DAORepository.insertNewAccountWallet(
                  '',
                  walletAccount.password,
                  walletAccount.name,
                  chain,
                ).then(wallet => {
                  DAORepository.insertNewAccountEthereum({
                    address: ethereumAddress,
                    privateKey: wallet.privateKey,
                  }).then(bitcoin => {
                    DAORepository.insertNewAddressSchema(wallet._id, [
                      `${chain}-${bitcoin._id}`,
                    ]).done();
                  });
                });
              });
            } else {
              check = false;
            }
            break;
          }

          case TOKEN_SYMBOL.sol: {
            if (Solana.checkValidPrivateKey(walletAccount.password)) {
              Solana.generateAddressFromPrivateKey(walletAccount.password).then(
                solanaAddress => {
                  DAORepository.insertNewAccountWallet(
                    '',
                    walletAccount.password,
                    walletAccount.name,
                    TOKEN_NAME.solana,
                  ).then(wallet => {
                    DAORepository.insertNewAccountSolana({
                      address: solanaAddress,
                      privateKey: wallet.privateKey,
                    }).then(solana => {
                      DAORepository.insertNewAddressSchema(wallet._id, [
                        `${TOKEN_NAME.solana}-${solana._id}`,
                      ]).done();
                    });
                  });
                },
              );
            } else {
              check = false;
            }
            break;
          }
        }
      });

      // set check is false if account single chain invalid
      if (check) {
        qrModule.loginSussces(CONSTANT_EVENT_EMITTER.ok);
        navigation.navigate(SCREEN_NAME.walletReadyScreen, {
          previousScreen: SCREEN_NAME.guidanceScreen,
        });
      } else {
        qrModule.loginSussces(CONSTANT_EVENT_EMITTER.failed);
      }
    });
  };

  //platform android

  const androidListener = () => {
    DeviceEventEmitter.addListener(
      CONSTANT_EVENT_EMITTER.importExtensionData,
      data => {
        if (!statusScanner) {
          statusScanner = true;
          generateAddressInAndroid(data.message);
        }
      },
    );
  };

  const generateAddressInAndroid = data => {
    const walletList = data.split('-');
    walletList.forEach(wallet => {
      const accountWallet = wallet.split(',');
      switch (accountWallet[1]) {
        case TOKEN_SYMBOL.multi: {
          DAORepository.insertNewAccountWallet(
            accountWallet[2],
            '',
            accountWallet[0],
            TOKEN_NAME.multiChain,
          ).then(walletMul => {
            DAORepository.insertNewAddressSchema(walletMul._id, []).then(
              result => {
                generateBitcoinUsingSeedPhraseForAndroid(
                  accountWallet[2],
                  result._id,
                );

                generateEthereumUsingSeedPhraseForAndroid(
                  accountWallet[2],
                  TOKEN_NAME.ethereum,
                  result._id,
                );

                generateSolanaUsingSeedPhraseForAndroid(
                  accountWallet[2],
                  result._id,
                );
              },
            );
          });
          break;
        }

        case TOKEN_SYMBOL.btc: {
          DAORepository.insertNewAccountWallet(
            '',
            accountWallet[2],
            accountWallet[0],
            TOKEN_NAME.bitcoin,
          ).then(wallet => {
            Bitcoin.generateAddressFromPrivateKey(accountWallet[2]).then(
              address => {
                const account = {
                  address: address,
                  privateKey: accountWallet[2],
                };
                DAORepository.insertNewAccountBitcoin(account).then(
                  bitcoinAccount => {
                    const addressList = [
                      `${TOKEN_NAME.bitcoin}-${bitcoinAccount._id}`,
                    ];
                    DAORepository.insertNewAddressSchema(
                      wallet._id,
                      addressList,
                    ).done();
                  },
                );
              },
            );
          });
          break;
        }

        case TOKEN_SYMBOL.bsc:
        case TOKEN_SYMBOL.eth: {
          const chain =
            accountWallet[1] === TOKEN_SYMBOL.eth
              ? TOKEN_NAME.ethereum
              : TOKEN_NAME.smartChain;

          DAORepository.insertNewAccountWallet(
            '',
            accountWallet[2],
            accountWallet[0],
            chain,
          ).then(wallet => {
            Ethereum.generateAddressFromPrivateKey(accountWallet[2]).then(
              address => {
                const account = {
                  address: address,
                  privateKey: accountWallet[2],
                };
                DAORepository.insertNewAccountEthereum(account).then(
                  ethereumAccount => {
                    const addressList = [`${chain}-${ethereumAccount._id}`];
                    DAORepository.insertNewAddressSchema(
                      wallet._id,
                      addressList,
                    ).done();
                  },
                );
              },
            );
          });
          break;
        }

        case TOKEN_SYMBOL.sol: {
          DAORepository.insertNewAccountWallet(
            '',
            accountWallet[2],
            accountWallet[0],
            TOKEN_NAME.solana,
          ).then(wallet => {
            Solana.generateAddressFromPrivateKey(accountWallet[2]).then(
              address => {
                const account = {
                  address: address,
                  privateKey: accountWallet[2],
                };
                DAORepository.insertNewAccountSolana(account).then(
                  solanaAccount => {
                    const addressList = [
                      `${TOKEN_NAME.solana}-${solanaAccount._id}`,
                    ];
                    DAORepository.insertNewAddressSchema(
                      wallet._id,
                      addressList,
                    ).done();
                  },
                );
              },
            );
          });
          break;
        }
      }
    });

    ScannerModule.backPressedScannerActivity();
    statusScanner = false;
    navigation.navigate(SCREEN_NAME.walletReadyScreen, {
      previousScreen: SCREEN_NAME.guidanceScreen,
    });
  };

  const generateBitcoinUsingSeedPhraseForAndroid = (
    seedPhrase,
    idAddressList,
  ) => {
    GenerateWalletAccountModule.generateBitcoinAccount(
      seedPhrase,
      tokenAccount => {
        const token = JSON.parse(tokenAccount);
        DAORepository.insertNewAccountBitcoin(token).then(bitcoin => {
          DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
            `${TOKEN_NAME.bitcoin}-${bitcoin._id}`,
            idAddressList,
          ).done();
        });
      },
    );
  };

  const generateEthereumUsingSeedPhraseForAndroid = (
    seedPhrase,
    tokenName,
    idAddressList,
  ) => {
    GenerateWalletAccountModule.generateEthereumAccount(
      seedPhrase,
      tokenAccount => {
        const token = JSON.parse(tokenAccount);
        DAORepository.insertNewAccountEthereum(token).then(ethereum => {
          DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
            `${tokenName}-${ethereum._id}`,
            idAddressList,
          ).done();
        });
      },
    );
  };

  const generateSolanaUsingSeedPhraseForAndroid = (
    seedPhrase,
    idAddressList,
  ) => {
    GenerateWalletAccountModule.generateSolanaAccount(
      seedPhrase,
      tokenAccount => {
        const token = JSON.parse(tokenAccount);
        DAORepository.insertNewAccountSolana(token).then(solana => {
          DAORepository.updateIdTokenOfAddressSchemaByIdAddressList(
            `${TOKEN_NAME.solana}-${solana._id}`,
            idAddressList,
          ).done();
        });
      },
    );
  };

  return (
    <Container>
      <View style={styles.button_back}>
        <CustomBackButton onPress={() => navigation.goBack()} />
      </View>
      <ScrollView style={{ flex: 1 }}>
        <Text style={[FONTS.t30b, styles.title]}>
          {t(STRINGS.sync_with_extension)}
        </Text>

        <Text style={[FONTS.t14r, styles.text_follow]}>
          {t(STRINGS.follow_the_steps_below_to)}
        </Text>

        <Text style={[FONTS.t14r, styles.text_step]}>
          {t(STRINGS.import_from_extension_step_1)}
        </Text>

        <View style={styles.image_contain}>
          <Image source={IMAGES.computer_nft} style={styles.image_computer} />
        </View>

        <Text style={[FONTS.t14r, styles.text_step, { marginTop: 0 }]}>
          {t(STRINGS.import_from_extension_step_2)}
        </Text>

        <View style={styles.image_contain}>
          <Image source={IMAGES.mobile_scan} style={styles.image_mobile} />
        </View>
      </ScrollView>
      <CustomButton
        styles={{ marginTop: 8 }}
        label={t(STRINGS.scan_qr_code)}
        isDisable={false}
        width={SIZES.width - SIZES.simpleMargin * 2}
        height={SIZES.buttonHeight}
        onPress={() => {
          Platform.OS === 'ios'
            ? qrModule.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.sync)
            : ScannerModule.navigateToNative(CONSTANTS.importFromExtension);
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  button_back: {
    alignItems: 'flex-start',
    width: '100%',
  },

  title: {
    color: COLOR.white,
    letterSpacing: -0.03,
    marginTop: SIZES.heightScreen * 0.032,
  },

  text_follow: {
    color: COLOR.textTermsCondition,
    marginTop: SIZES.heightScreen * 0.03,
  },

  text_step: {
    marginTop: 4,
    color: COLOR.textTermsCondition,
  },

  image_contain: {
    paddingTop: SIZES.heightScreen * 0.039,
    paddingBottom: SIZES.heightScreen * 0.055,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image_computer: {
    marginLeft: SIZES.width * 0.25,
    height: SIZES.heightScreen * 0.163,
    width: SIZES.widthScreen * 0.546,
  },

  image_mobile: {
    width: SIZES.widthScreen * 0.437,
    height: SIZES.heightScreen * 0.206,
  },

  container_button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GuidanceScreen;
