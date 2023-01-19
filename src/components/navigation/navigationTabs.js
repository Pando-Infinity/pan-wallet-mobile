import React, { useEffect, useRef } from 'react';
import BottomTabs from '../../components/navigation/tabs';
import {
  CONSTANT_EVENT_EMITTER,
  LIFE_CYCLE_APP_STATE,
  PAN_CONNECT,
  SCREEN_NAME,
  TABLE_NAME,
  TIME_OUT,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { DAORepository, NativeAsyncStorage, storage } from '../../databases';
import { popParams } from 'stores/reducer/connectDappSlice';
import {
  DeviceEventEmitter,
  Linking,
  NativeEventEmitter,
  NativeModules,
  Platform,
  View,
} from 'react-native';
import { makeURL, removeItemOnce } from 'utils/util';
import { chain } from 'models/Coins';
import PropTypes from 'prop-types';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { setNavigationBackEvent } from 'stores/reducer/navigationEventSlice';
import Constants from '../../constants/constants';
import {
  BSCAssetToken,
  ETHAssetToken,
  SOLAssetToken,
} from 'screens/Home/HomeScreen';
import { getWallet } from 'utils/wallet.util';
import {
  isApproveForAll,
  isApproveTokenOfDeposit,
} from 'walletCore/checkApprove';
import { setFinishTimeOut } from 'stores/reducer/isFinishTimeoutSlice';
import { CONSTANTS } from 'constants';

const bscToken = BSCAssetToken;
const ethToken = ETHAssetToken;
const solToken = SOLAssetToken;

const NavigationTabs = ({ navigation }) => {
  const { params } = useSelector(state => state.params);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  const goBackEvent = useSelector(
    state => state.navigationEven.navigationBackEvent,
  );
  const transferLoading = useSelector(
    state => state.transferLoading.transferLoading,
  );
  const isFinishTimeOut = useSelector(
    state => state.isFinishTimeout.isFinishTimeout,
  );

  const appState = useRef();
  const isTimeOut = useRef();

  let timeAtBackground = 0;
  let timeAtActive = 0;

  const idCurrentWallet = storage.getNumber(Constants.rememberWalletIDKey) ?? 1;

  const getTokenFromFirebase = (chainToken, contract) => {
    switch (chainToken) {
      case TOKEN_SYMBOL.eth:
        return ethToken.find(item => item.id === contract);
      case TOKEN_SYMBOL.bsc:
        return bscToken.find(item => item.id === contract);
      case TOKEN_SYMBOL.sol:
        return solToken.find(item => item.id === contract);
      default:
        return null;
    }
  };

  const getTokenFromStorage = (contract, walletType, walletId) => {
    let tokenList = [];
    switch (walletType) {
      case TOKEN_NAME.multiChain: {
        const list = storage.getString(
          `${CONSTANTS.newTokenListMultiData}${walletId}`,
        );
        if (list) {
          tokenList = JSON.parse(list);
        }
        break;
      }

      case TOKEN_NAME.ethereum: {
        const list = storage.getString(
          `${CONSTANTS.newTokenListETHData}${walletId}`,
        );
        if (list) {
          tokenList = JSON.parse(list);
        }
        break;
      }

      case TOKEN_NAME.smartChain: {
        const list = storage.getString(
          `${CONSTANTS.newTokenListBSCData}${walletId}`,
        );
        if (list) {
          tokenList = JSON.parse(list);
        }
        break;
      }

      case TOKEN_NAME.solana: {
        const list = storage.getString(
          `${CONSTANTS.newTokenListSOLData}${walletId}`,
        );
        if (list) {
          tokenList = JSON.parse(list);
        }
        break;
      }
    }

    const tokenRaw = tokenList.find(item => item.contractAddress === contract);
    const tokenConvert = {};
    if (tokenRaw) {
      tokenConvert.decimals = tokenRaw.decimal;
      tokenConvert.id = tokenRaw.contractAddress;
      tokenConvert.logo = tokenRaw.image;
      tokenConvert.name = tokenRaw.name;
      tokenConvert.symbol = tokenRaw.asset_id;
      tokenConvert.type = tokenRaw.type;

      return tokenConvert;
    }

    return null;
  };

  const getAddress = (chainSymbol, rawAddress) => {
    switch (chainSymbol) {
      case TOKEN_SYMBOL.btc: {
        return rawAddress.btc;
      }
      case TOKEN_SYMBOL.eth: {
        return rawAddress.eth;
      }
      case TOKEN_SYMBOL.bsc: {
        return rawAddress.bsc;
      }
      case TOKEN_SYMBOL.sol: {
        return rawAddress.sol;
      }
    }
  };

  const handleConnectFromDapp = () => {
    if (params.length) {
      const param = params[params.length - 1];
      dispatch(popParams());
      switch (param.requestType) {
        case PAN_CONNECT.path.connect: {
          if (param.access_token) {
            DAORepository.getAllData(TABLE_NAME.session_connect)
              .then(objs => {
                const data = objs.filter(
                  obj =>
                    obj._id === param.access_token &&
                    obj.walletID === idCurrentWallet,
                );
                if (data.length === 0) {
                  handleNavigateConnectScreen(param);
                } else {
                  const chainSymbol = param.access_token.split('-')[0];
                  if (chainSymbol === param.chain) {
                    const url = makeURL(
                      data[0].schema,
                      PAN_CONNECT.response.connect,
                      {
                        chain: param.chain,
                        address: JSON.stringify(data[0].address),
                        pan_access_token: param.access_token,
                        ...PAN_CONNECT.pan_response.success,
                      },
                    );

                    Platform.OS === 'android'
                      ? NativeModules.ConnectWalletModule.openLinkToDApp(url)
                      : Linking.openURL(url).done();
                  } else {
                    const url = makeURL(
                      data[0].schema,
                      PAN_CONNECT.response.connect,
                      {
                        ...PAN_CONNECT.pan_response.login_width_other_chain,
                      },
                    );

                    Platform.OS === 'android'
                      ? NativeModules.ConnectWalletModule.openLinkToDApp(url)
                      : Linking.openURL(url).done();
                  }
                }
              })
              .catch(error => {
                console.error(error);
              });
          } else {
            handleNavigateConnectScreen(param);
          }
          break;
        }

        case PAN_CONNECT.path.transfer: {
          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (
                !!param.bundle &&
                !!param.chain &&
                !!param.amount &&
                !!param.addressReceive
              ) {
                if (
                  param.chain !== TOKEN_SYMBOL.btc &&
                  param.chain !== TOKEN_SYMBOL.eth &&
                  param.chain !== TOKEN_SYMBOL.bsc &&
                  param.chain !== TOKEN_SYMBOL.sol
                ) {
                  openToDapp(
                    connection.schema,
                    PAN_CONNECT.response.transfer,
                    PAN_CONNECT.pan_response.not_support_block_chain,
                  );
                } else {
                  getWallet(connection.walletID, address, param.chain).then(
                    wallet => {
                      if (!wallet) {
                        openToDapp(
                          connection.schema,
                          PAN_CONNECT.response.transfer,
                          PAN_CONNECT.pan_response.user_wallet_not_sp,
                        );
                      } else {
                        const chainConvert =
                          param.chain.toUpperCase() === 'BSC'
                            ? 'BNB'
                            : param.chain.toUpperCase();
                        let token = chain.find(
                          item => item.symbol === chainConvert,
                        );

                        if (String(param.contractAddress) !== 'null') {
                          token = getTokenFromFirebase(
                            param.chain,
                            param.contractAddress,
                          );

                          if (!token) {
                            token = getTokenFromStorage(
                              param.contractAddress,
                              wallet.walletType,
                              connection.walletID,
                            );
                          }
                        }

                        if (token) {
                          if (!checkHaveScreen(param)) {
                            navigation.push(PAN_CONNECT.screen_name.transfer, {
                              requestType: param.requestType,
                              accessToken: param.accessToken,
                              schema: connection.schema,
                              wallet: wallet,
                              url: connection.url,
                              contractAddress: param.contractAddress,
                              token: token,
                              addressReceive: param.addressReceive,
                              amount: param.amount,
                              bundle: param.bundle,
                            });
                          } else {
                            openToDapp(
                              connection.schema,
                              PAN_CONNECT.response.transfer,
                              PAN_CONNECT.pan_response.session_did_handle,
                            );
                          }
                        } else {
                          openToDapp(
                            connection.schema,
                            PAN_CONNECT.response.transfer,
                            PAN_CONNECT.pan_response.token_not_support,
                          );
                        }
                      }
                    },
                  );
                }
              } else {
                openToDapp(
                  connection.schema,
                  PAN_CONNECT.response.transfer,
                  PAN_CONNECT.pan_response.wrong_format,
                );
              }
            } else {
              openToDapp(
                param.scheme,
                PAN_CONNECT.response.transfer,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.approve: {
          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (param.chain !== TOKEN_SYMBOL.btc) {
                if (param.chain !== TOKEN_SYMBOL.sol) {
                  if (
                    !!param.bundle &&
                    !!param.type &&
                    !!param.chain &&
                    !!param.contractAddress &&
                    param.transactionData &&
                    param.transactionData !== {}
                  ) {
                    getWallet(connection.walletID, address, param.chain).then(
                      async wallet => {
                        if (!wallet) {
                          openToDapp(
                            connection.schema,
                            PAN_CONNECT.response.approve,
                            {
                              type: param.type,
                              ...PAN_CONNECT.pan_response.user_wallet_not_sp,
                            },
                          );
                        } else {
                          switch (param.type) {
                            case PAN_CONNECT.path.depositToken.replace('/', ''):
                            case PAN_CONNECT.path.withdrawToken.replace(
                              '/',
                              '',
                            ): {
                              if (!!param.amount && !!param.addressSpender) {
                                if (!checkHaveScreen(param)) {
                                  const isApprove =
                                    await isApproveTokenOfDeposit(
                                      wallet.address,
                                      param.addressSpender,
                                      param.contractAddress,
                                      param.chain,
                                      param.amount,
                                    );
                                  if (!isApprove) {
                                    let token = getTokenFromFirebase(
                                      param.chain,
                                      param.contractAddress,
                                    );

                                    if (!token) {
                                      token = getTokenFromStorage(
                                        param.contractAddress,
                                        wallet.walletType,
                                        connection.walletID,
                                      );
                                    }
                                    if (token) {
                                      navigation.push(
                                        SCREEN_NAME.approveTokenScreen,
                                        {
                                          accessToken: param.accessToken,
                                          type: param.type,
                                          schema: connection.schema,
                                          chain: param.chain,
                                          wallet: wallet,
                                          contractAddress:
                                            param.contractAddress,
                                          tokenSymbol: token.symbol,
                                          bundle: param.bundle,
                                          requestType: param.requestType,
                                          transactionData:
                                            param.transactionData,
                                          amount: param.amount,
                                        },
                                      );
                                    } else {
                                      openToDapp(
                                        connection.schema,
                                        PAN_CONNECT.response.approve,
                                        {
                                          type: param.type,
                                          ...PAN_CONNECT.pan_response
                                            .token_not_support,
                                        },
                                      );
                                    }
                                  } else {
                                    openToDapp(
                                      connection.schema,
                                      PAN_CONNECT.response.approve,
                                      {
                                        ...PAN_CONNECT.pan_response.is_approved,
                                        type: param.type,
                                      },
                                    );
                                  }
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    PAN_CONNECT.response.approve,
                                    {
                                      ...PAN_CONNECT.pan_response
                                        .session_did_handle,
                                      type: param.type,
                                    },
                                  );
                                }
                              } else {
                                openToDapp(
                                  connection.schema,
                                  PAN_CONNECT.response.approve,
                                  {
                                    ...PAN_CONNECT.pan_response.wrong_format,
                                    type: param.type,
                                  },
                                );
                              }
                              break;
                            }

                            case PAN_CONNECT.path.buyNFT.replace('/', ''): {
                              if (
                                !!param.tokenSymbol &&
                                !!param.amount &&
                                !!param.addressSpender
                              ) {
                                if (!checkHaveScreen(param)) {
                                  const isApprove =
                                    await isApproveTokenOfDeposit(
                                      wallet.address,
                                      param.addressSpender,
                                      param.contractAddress,
                                      param.chain,
                                      param.amount,
                                    );
                                  if (!isApprove) {
                                    navigation.push(
                                      SCREEN_NAME.approveTokenScreen,
                                      {
                                        requestType: param.requestType,
                                        accessToken: param.accessToken,
                                        type: param.type,
                                        schema: connection.schema,
                                        chain: param.chain,
                                        wallet: wallet,
                                        contractAddress: param.contractAddress,
                                        tokenSymbol: param.tokenSymbol,
                                        amount: param.amount,
                                        transactionData: param.transactionData,
                                        bundle: param.bundle,
                                      },
                                    );
                                  } else {
                                    openToDapp(
                                      connection.schema,
                                      PAN_CONNECT.response.approve,
                                      {
                                        ...PAN_CONNECT.pan_response.is_approved,
                                        type: param.type,
                                      },
                                    );
                                  }
                                } else {
                                  openToDapp(
                                    param.scheme,
                                    PAN_CONNECT.response.approve,
                                    {
                                      ...PAN_CONNECT.pan_response
                                        .session_did_handle,
                                      type: param.type,
                                    },
                                  );
                                }
                              } else {
                                openToDapp(
                                  connection.schema,
                                  PAN_CONNECT.response.approve,
                                  {
                                    ...PAN_CONNECT.pan_response.wrong_format,
                                    type: param.type,
                                  },
                                );
                              }
                              break;
                            }

                            case PAN_CONNECT.path.unStakeNFT.replace('/', ''): {
                              if (param?.addressSpender) {
                                if (!checkHaveScreen(param)) {
                                  const isApprove =
                                    await isApproveTokenOfDeposit(
                                      wallet.address,
                                      param.addressSpender,
                                      param.contractAddress,
                                      param.chain,
                                      param.amount,
                                    );
                                  if (!isApprove) {
                                    navigation.push(
                                      SCREEN_NAME.approveTokenScreen,
                                      {
                                        requestType: param.requestType,
                                        accessToken: param.accessToken,
                                        type: param.type,
                                        schema: connection.schema,
                                        chain: param.chain,
                                        wallet: wallet,
                                        contractAddress: param.contractAddress,
                                        tokenSymbol: param.tokenSymbol,
                                        amount: param.amount,
                                        transactionData: param.transactionData,
                                        bundle: param.bundle,
                                      },
                                    );
                                  } else {
                                    openToDapp(
                                      connection.schema,
                                      PAN_CONNECT.response.approve,
                                      {
                                        ...PAN_CONNECT.pan_response.is_approved,
                                        type: param.type,
                                      },
                                    );
                                  }
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    PAN_CONNECT.response.approve,
                                    {
                                      ...PAN_CONNECT.pan_response
                                        .session_did_handle,
                                      type: param.type,
                                    },
                                  );
                                }
                              } else {
                                openToDapp(
                                  connection.schema,
                                  PAN_CONNECT.response.approve,
                                  {
                                    ...PAN_CONNECT.pan_response.wrong_format,
                                    type: param.type,
                                  },
                                );
                              }
                              break;
                            }

                            case PAN_CONNECT.path.sellNFT.replace('/', ''):
                            case PAN_CONNECT.path.stakeNFT.replace('/', ''):
                            case PAN_CONNECT.path.buyBox.replace('/', ''):
                            case PAN_CONNECT.path.unlockBox.replace('/', ''): {
                              if (param.addressOperator) {
                                if (!checkHaveScreen(param)) {
                                  const isApproveAll = await isApproveForAll(
                                    wallet.address,
                                    param.addressOperator,
                                    param.contractAddress,
                                    param.chain,
                                  );
                                  if (!isApproveAll) {
                                    navigation.push(
                                      SCREEN_NAME.approveAllTransactionScreen,
                                      {
                                        accessToken: param.accessToken,
                                        type: param.type,
                                        schema: connection.schema,
                                        chain: param.chain,
                                        wallet: wallet,
                                        contractAddress: param.contractAddress,
                                        transactionData: param.transactionData,
                                        bundle: param.bundle,
                                        requestType: param.requestType,
                                      },
                                    );
                                  } else {
                                    openToDapp(
                                      connection.schema,
                                      PAN_CONNECT.response.approve,
                                      {
                                        ...PAN_CONNECT.pan_response.is_approved,
                                        type: param.type,
                                      },
                                    );
                                  }
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    PAN_CONNECT.response.approve,
                                    {
                                      ...PAN_CONNECT.pan_response
                                        .session_did_handle,
                                      type: param.type,
                                    },
                                  );
                                }
                              } else {
                                openToDapp(
                                  connection.schema,
                                  PAN_CONNECT.response.approve,
                                  {
                                    ...PAN_CONNECT.pan_response.wrong_format,
                                    type: param.type,
                                  },
                                );
                              }
                              break;
                            }
                          }
                        }
                      },
                    );
                  } else {
                    openToDapp(
                      connection.schema,
                      PAN_CONNECT.response.approve,
                      {
                        type: param.type,
                        ...PAN_CONNECT.pan_response.wrong_format,
                      },
                    );
                  }
                } else {
                  openToDapp(connection.schema, PAN_CONNECT.response.approve, {
                    type: param.type,
                    ...PAN_CONNECT.pan_response.solana_without_approval,
                  });
                }
              } else {
                openToDapp(connection.schema, PAN_CONNECT.response.approve, {
                  type: param.type,
                  ...PAN_CONNECT.pan_response.not_support_btc,
                });
              }
            } else {
              openToDapp(
                param.scheme,
                PAN_CONNECT.response.approve,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.buyNFT:
        case PAN_CONNECT.path.sellNFT:
        case PAN_CONNECT.path.sendNFT:
        case PAN_CONNECT.path.stakeNFT:
        case PAN_CONNECT.path.unStakeNFT: {
          let isHaveTokenSymbol = true;
          let isAddressSpender = true;
          let isToAddress = true;
          let isAddressOperator = true;
          let path;
          switch (param.requestType) {
            case PAN_CONNECT.path.buyNFT: {
              path = PAN_CONNECT.response.buyNFT;
              isHaveTokenSymbol = !!param.tokenSymbol;
              isAddressSpender = !!param.addressSpender;
              break;
            }

            case PAN_CONNECT.path.sellNFT: {
              path = PAN_CONNECT.response.sellNFT;
              isHaveTokenSymbol = !!param.tokenSymbol;
              isAddressOperator = !!param.addressOperator;
              break;
            }

            case PAN_CONNECT.path.sendNFT: {
              path = PAN_CONNECT.response.sendNFT;
              isToAddress = !!param.to;
              break;
            }

            case PAN_CONNECT.path.stakeNFT: {
              path = PAN_CONNECT.response.stakeNFT;
              isAddressOperator = !!param.addressOperator;
              break;
            }

            case PAN_CONNECT.path.unStakeNFT: {
              path = PAN_CONNECT.response.unStakeNFT;
              break;
            }
          }

          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (param.chain !== TOKEN_SYMBOL.btc) {
                if (
                  !!param.bundle &&
                  !!param.chain &&
                  isHaveTokenSymbol &&
                  !!param.contractAddress &&
                  !!param.nft.id &&
                  !!param.nft.name &&
                  !!param.transactionData &&
                  isAddressSpender &&
                  isToAddress &&
                  isAddressOperator
                ) {
                  getWallet(connection.walletID, address, param.chain).then(
                    async wallet => {
                      if (wallet) {
                        switch (param.requestType) {
                          case PAN_CONNECT.path.buyNFT: {
                            if (!checkHaveScreen(param)) {
                              try {
                                const isApprove =
                                  param.chain !== TOKEN_SYMBOL.sol
                                    ? await isApproveTokenOfDeposit(
                                        wallet.address,
                                        param.addressSpender,
                                        param.contractAddress,
                                        param.chain,
                                        param.amount,
                                      )
                                    : true;
                                if (isApprove) {
                                  navigation.push(
                                    SCREEN_NAME.confirmDappTransactionNftScreen,
                                    {
                                      requestType: param.requestType,
                                      accessToken: param.accessToken,
                                      schema: connection.schema,
                                      chain: param.chain,
                                      wallet: wallet,
                                      url: connection.url,
                                      contractAddress: param.contractAddress,
                                      tokenSymbol: param.tokenSymbol,
                                      nft: param.nft,
                                      transactionData: param.transactionData,
                                      to: param.to,
                                      bundle: param.bundle,
                                    },
                                  );
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    path,
                                    PAN_CONNECT.pan_response.not_approve,
                                  );
                                }
                              } catch (error) {
                                openToDapp(connection.schema, path, {
                                  ...PAN_CONNECT.pan_response.error,
                                  error,
                                });
                              }
                            } else {
                              openToDapp(
                                connection.schema,
                                path,
                                PAN_CONNECT.pan_response.session_did_handle,
                              );
                            }
                            break;
                          }

                          case PAN_CONNECT.path.sellNFT:
                          case PAN_CONNECT.path.stakeNFT: {
                            if (!checkHaveScreen(param)) {
                              try {
                                const isApproveAll =
                                  param.chain !== TOKEN_SYMBOL.sol
                                    ? await isApproveForAll(
                                        wallet.address,
                                        param.addressOperator,
                                        param.contractAddress,
                                        param.chain,
                                      )
                                    : true;
                                if (isApproveAll) {
                                  navigation.push(
                                    SCREEN_NAME.confirmDappTransactionNftScreen,
                                    {
                                      requestType: param.requestType,
                                      schema: connection.schema,
                                      accessToken: param.accessToken,
                                      chain: param.chain,
                                      wallet: wallet,
                                      url: connection.url,
                                      contractAddress: param.contractAddress,
                                      tokenSymbol: param.tokenSymbol,
                                      nft: param.nft,
                                      transactionData: param.transactionData,
                                      bundle: param.bundle,
                                    },
                                  );
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    path,
                                    PAN_CONNECT.pan_response.not_approve,
                                  );
                                }
                              } catch (e) {
                                openToDapp(connection.schema, path, {
                                  ...PAN_CONNECT.pan_response.error,
                                  e,
                                });
                              }
                            } else {
                              openToDapp(
                                connection.schema,
                                path,
                                PAN_CONNECT.pan_response.session_did_handle,
                              );
                            }

                            break;
                          }

                          case PAN_CONNECT.path.unStakeNFT: {
                            if (!checkHaveScreen(param)) {
                              try {
                                const isApprove =
                                  param.chain !== TOKEN_SYMBOL.sol
                                    ? await isApproveTokenOfDeposit(
                                        wallet.address,
                                        param.addressSpender,
                                        param.contractAddress,
                                        param.chain,
                                        param.amount,
                                      )
                                    : true;
                                if (isApprove) {
                                  navigation.push(
                                    SCREEN_NAME.confirmDappTransactionNftScreen,
                                    {
                                      requestType: param.requestType,
                                      schema: connection.schema,
                                      accessToken: param.accessToken,
                                      chain: param.chain,
                                      wallet: wallet,
                                      url: connection.url,
                                      contractAddress: param.contractAddress,
                                      nft: param.nft,
                                      to: param.to,
                                      transactionData: param.transactionData,
                                      bundle: param.bundle,
                                    },
                                  );
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    path,
                                    PAN_CONNECT.pan_response.not_approve,
                                  );
                                }
                              } catch (e) {
                                openToDapp(connection.schema, path, {
                                  ...PAN_CONNECT.pan_response.error,
                                  e,
                                });
                              }
                            } else {
                              openToDapp(
                                connection.schema,
                                path,
                                PAN_CONNECT.pan_response.session_did_handle,
                              );
                            }
                            break;
                          }

                          default: {
                            if (!checkHaveScreen(param)) {
                              navigation.push(
                                SCREEN_NAME.confirmDappTransactionNftScreen,
                                {
                                  requestType: param.requestType,
                                  schema: connection.schema,
                                  accessToken: param.accessToken,
                                  chain: param.chain,
                                  wallet: wallet,
                                  url: connection.url,
                                  contractAddress: param.contractAddress,
                                  nft: param.nft,
                                  to: param.to,
                                  transactionData: param.transactionData,
                                  bundle: param.bundle,
                                },
                              );
                            } else {
                              openToDapp(
                                connection.schema,
                                path,
                                PAN_CONNECT.pan_response.session_did_handle,
                              );
                            }

                            break;
                          }
                        }
                      } else {
                        openToDapp(
                          connection.schema,
                          path,
                          PAN_CONNECT.pan_response.user_wallet_not_sp,
                        );
                      }
                    },
                  );
                } else {
                  openToDapp(
                    connection.schema,
                    path,
                    PAN_CONNECT.pan_response.wrong_format,
                  );
                }
              } else {
                openToDapp(
                  connection.schema,
                  path,
                  PAN_CONNECT.pan_response.not_support_btc,
                );
              }
            } else {
              openToDapp(
                param.scheme,
                path,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.depositToken:
        case PAN_CONNECT.path.withdrawToken: {
          let path;
          let isAddressSpender = true;
          if (param.requestType === PAN_CONNECT.path.depositToken) {
            path = PAN_CONNECT.response.depositToken;
            isAddressSpender =
              param.addressSpender && param.addressSpender !== '';
          } else {
            path = PAN_CONNECT.response.withdrawToken;
          }

          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (chain !== TOKEN_SYMBOL.btc) {
                if (
                  !!param.bundle &&
                  !!param.amount &&
                  !!param.contractAddress &&
                  isAddressSpender &&
                  param.transactionData &&
                  param.transactionData !== {}
                ) {
                  getWallet(connection.walletID, address, param.chain).then(
                    async wallet => {
                      if (wallet) {
                        let token = getTokenFromFirebase(
                          param.chain,
                          param.contractAddress,
                        );

                        if (!token) {
                          token = getTokenFromStorage(
                            param.contractAddress,
                            wallet.walletType,
                            connection.walletID,
                          );
                        }

                        if (token) {
                          if (!checkHaveScreen(param)) {
                            try {
                              if (param.chain !== TOKEN_SYMBOL.sol) {
                                const isApprove =
                                  param.requestType ===
                                  PAN_CONNECT.path.depositToken
                                    ? await isApproveTokenOfDeposit(
                                        wallet.address,
                                        param.addressSpender,
                                        param.contractAddress,
                                        param.chain,
                                        param.amount,
                                      )
                                    : true;
                                if (isApprove) {
                                  navigation.push(
                                    PAN_CONNECT.screen_name.transfer,
                                    {
                                      requestType: param.requestType,
                                      accessToken: param.accessToken,
                                      schema: connection.schema,
                                      chain: param.chain,
                                      wallet: wallet,
                                      url: connection.url,
                                      contractAddress: param.contractAddress,
                                      token: token,
                                      amount: param.amount,
                                      to: param.to,
                                      from: param.from,
                                      bundle: param.bundle,
                                      transactionData: param.transactionData,
                                    },
                                  );
                                } else {
                                  openToDapp(
                                    connection.schema,
                                    path,
                                    PAN_CONNECT.pan_response.not_approve,
                                  );
                                }
                              } else {
                                navigation.push(
                                  PAN_CONNECT.screen_name.transfer,
                                  {
                                    requestType: param.requestType,
                                    accessToken: param.accessToken,
                                    schema: connection.schema,
                                    chain: param.chain,
                                    wallet: wallet,
                                    url: connection.url,
                                    contractAddress: param.contractAddress,
                                    token: token,
                                    amount: param.amount,
                                    bundle: param.bundle,
                                    transactionData: param.transactionData,
                                  },
                                );
                              }
                            } catch (e) {
                              openToDapp(connection.schema, path, {
                                ...PAN_CONNECT.pan_response.error,
                                e,
                              });
                            }
                          } else {
                            openToDapp(
                              connection.schema,
                              path,
                              PAN_CONNECT.pan_response.session_did_handle,
                            );
                          }
                        } else {
                          openToDapp(
                            connection.schema,
                            path,
                            PAN_CONNECT.pan_response.token_not_support,
                          );
                        }
                      } else {
                        openToDapp(
                          connection.schema,
                          path,
                          PAN_CONNECT.pan_response.user_wallet_not_sp,
                        );
                      }
                    },
                  );
                } else {
                  openToDapp(
                    connection.schema,
                    path,
                    PAN_CONNECT.pan_response.wrong_format,
                  );
                }
              } else {
                openToDapp(
                  connection.schema,
                  path,
                  PAN_CONNECT.pan_response.not_support_btc,
                );
              }
            } else {
              openToDapp(
                param.scheme,
                path,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.buyBox:
        case PAN_CONNECT.path.unlockBox:
        case PAN_CONNECT.path.openBox:
        case PAN_CONNECT.path.sendBox: {
          let path;
          let isAddressOperator = true;
          let isToAddress = true;
          switch (param.requestType) {
            case PAN_CONNECT.path.buyBox: {
              path = PAN_CONNECT.response.buyBox;
              isAddressOperator = !!param.addressOperator;
              break;
            }

            case PAN_CONNECT.path.sendBox: {
              path = PAN_CONNECT.response.sendBox;
              isToAddress = !!param.to;
              break;
            }

            case PAN_CONNECT.path.unlockBox: {
              path = PAN_CONNECT.response.unlockBox;
              isAddressOperator = !!param.addressOperator;
              break;
            }

            case PAN_CONNECT.path.openBox: {
              path = PAN_CONNECT.response.openBox;
              break;
            }
          }

          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );

            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (chain !== TOKEN_SYMBOL.btc) {
                if (
                  !!param.bundle &&
                  !!param.name &&
                  !!param.contractAddress &&
                  !!param.transactionData &&
                  isAddressOperator &&
                  isToAddress
                ) {
                  getWallet(connection.walletID, address, param.chain).then(
                    async wallet => {
                      if (wallet) {
                        if (!checkHaveScreen(param)) {
                          if (
                            param.requestType === PAN_CONNECT.path.openBox ||
                            param.requestType === PAN_CONNECT.path.sendBox
                          ) {
                            navigateToConfirmDappTransactionBoxScreen({
                              requestType: param.requestType,
                              accessToken: param.accessToken,
                              schema: connection.schema,
                              chain: param.chain,
                              wallet: wallet,
                              url: connection.url,
                              contractAddress: param.contractAddress,
                              transactionData: param.transactionData,
                              name: param.name,
                              to: param.to,
                              bundle: param.bundle,
                            });
                          } else {
                            try {
                              const isApproveAll =
                                param.chain !== TOKEN_SYMBOL.sol
                                  ? await isApproveForAll(
                                      wallet.address,
                                      param.addressOperator,
                                      param.contractAddress,
                                      param.chain,
                                    )
                                  : true;
                              if (isApproveAll) {
                                navigateToConfirmDappTransactionBoxScreen({
                                  requestType: param.requestType,
                                  accessToken: param.accessToken,
                                  schema: connection.schema,
                                  chain: param.chain,
                                  wallet: wallet,
                                  url: connection.url,
                                  contractAddress: param.contractAddress,
                                  transactionData: param.transactionData,
                                  name: param.name,
                                  bundle: param.bundle,
                                });
                              } else {
                                openToDapp(
                                  connection.schema,
                                  path,
                                  PAN_CONNECT.pan_response.not_approve,
                                );
                              }
                            } catch (e) {
                              openToDapp(connection.schema, path, {
                                ...PAN_CONNECT.pan_response.error,
                                e,
                              });
                            }
                          }
                        } else {
                          openToDapp(
                            param.scheme,
                            path,
                            PAN_CONNECT.pan_response.session_did_handle,
                          );
                        }
                      } else {
                        openToDapp(
                          connection.schema,
                          path,
                          PAN_CONNECT.pan_response.user_wallet_not_sp,
                        );
                      }
                    },
                  );
                } else {
                  openToDapp(
                    connection.schema,
                    path,
                    PAN_CONNECT.pan_response.wrong_format,
                  );
                }
              } else {
                openToDapp(
                  connection.schema,
                  path,
                  PAN_CONNECT.pan_response.not_support_btc,
                );
              }
            } else {
              openToDapp(
                param.scheme,
                path,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.cancelTransaction: {
          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const isHandingTransfer = transferLoading.find(
                item =>
                  item.bundle === param.bundle &&
                  item.accessToken === param.accessToken &&
                  item.isLoading === true,
              );
              if (isHandingTransfer) {
                openToDapp(
                  connection.schema,
                  PAN_CONNECT.response.cancelTransaction,
                  PAN_CONNECT.pan_response.handled_in_blockchain,
                );
              } else {
                const stackScreen = navigation.getState().routes;
                const screen = stackScreen.find(
                  item =>
                    item.params &&
                    item.params.accessToken === param.accessToken &&
                    item.params.bundle === param.bundle,
                );
                if (screen) {
                  const screens = removeItemOnce(stackScreen, screen);
                  navigation.reset({
                    index: 0,
                    routes: screens,
                  });
                  openToDapp(
                    connection.schema,
                    PAN_CONNECT.response.cancelTransaction,
                    PAN_CONNECT.pan_response.success,
                  );
                } else {
                  openToDapp(
                    connection.schema,
                    PAN_CONNECT.response.cancelTransaction,
                    PAN_CONNECT.pan_response.no_action_cancel,
                  );
                }
              }
            } else {
              openToDapp(
                param.scheme,
                PAN_CONNECT.response.cancelTransaction,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }

        case PAN_CONNECT.path.cancelTransactionNonSuccess: {
          DAORepository.getAllData(TABLE_NAME.session_connect).then(data => {
            const connection = data.find(
              item =>
                item._id === param.accessToken &&
                item.walletID === idCurrentWallet,
            );
            if (connection) {
              const address = getAddress(param.chain, connection.address);
              if (
                !!param.bundle &&
                !!param.chain &&
                !!param.contractAddress &&
                !!param.transactionData
              ) {
                getWallet(connection.walletID, address, param.chain).then(
                  async wallet => {
                    if (wallet) {
                      if (!checkHaveScreen(param)) {
                        navigateToConfirmDappTransactionBoxScreen({
                          requestType: param.requestType,
                          accessToken: param.accessToken,
                          schema: connection.schema,
                          chain: param.chain,
                          wallet: wallet,
                          url: connection.url,
                          contractAddress: param.contractAddress,
                          transactionData: param.transactionData,
                          name: param.name,
                          bundle: param.bundle,
                        });
                      } else {
                        openToDapp(
                          param.scheme,
                          PAN_CONNECT.response.cancelTransactionNonSuccess,
                          PAN_CONNECT.pan_response.session_did_handle,
                        );
                      }
                    } else {
                      openToDapp(
                        connection.schema,
                        PAN_CONNECT.response.cancelTransactionNonSuccess,
                        PAN_CONNECT.pan_response.user_wallet_not_sp,
                      );
                    }
                  },
                );
              } else {
                openToDapp(
                  connection.schema,
                  PAN_CONNECT.response.cancelTransactionNonSuccess,
                  PAN_CONNECT.pan_response.wrong_format,
                );
              }
            } else {
              openToDapp(
                param.scheme,
                PAN_CONNECT.response.cancelTransactionNonSuccess,
                PAN_CONNECT.pan_response.not_connect,
              );
            }
          });
          break;
        }
      }
    }
  };

  const handleNavigateConnectScreen = param => {
    if (!checkHaveConnectScreen(param)) {
      navigation.push(PAN_CONNECT.screen_name.connect, param);
    } else {
      openToDapp(
        param.scheme,
        PAN_CONNECT.response.transfer,
        PAN_CONNECT.pan_response.session_did_handle,
      );
    }
  };

  const checkHaveConnectScreen = param => {
    const stackScreen = navigation.getState().routes;
    const screen = stackScreen.find(
      item => item.params && item.params.bundle === param.bundle,
    );

    return !!screen;
  };

  const checkHaveScreen = param => {
    const stackScreen = navigation.getState().routes;
    const screen = stackScreen.find(
      item =>
        item.params &&
        item.params.accessToken === param.accessToken &&
        item.params.bundle === param.bundle,
    );

    return !!screen;
  };

  const navigateToConfirmDappTransactionBoxScreen = param => {
    navigation.push(SCREEN_NAME.confirmDappTransactionBoxScreen, param);
  };

  const openToDapp = (schema, requestType, param) => {
    try {
      const url = makeURL(schema, requestType, param);

      Platform.OS === 'android'
        ? NativeModules.ConnectWalletModule.openLinkToDApp(url)
        : Linking.openURL(url).done();
    } catch (e) {
      console.log(e);
    }
  };

  const handleEventListenLifeCycle = nextAppState => {
    const stackScreen = navigation.getState().routes;

    const homeScreen = stackScreen.filter(
      item => item.name === SCREEN_NAME.navigationBottomTab,
    );

    const indexOfHomeScreen = stackScreen.indexOf(
      homeScreen[homeScreen.length - 1],
    );

    const stacks = [];

    for (let i = indexOfHomeScreen; i < stackScreen.length; i++) {
      stacks.push(stackScreen[i]);
    }

    const currentScreen = stackScreen[stackScreen.length - 1];

    const isGoHomeWithRememberMe = storage.getBoolean(
      Constants.isGoHomeWithRememberMeKey,
    );

    if (nextAppState === LIFE_CYCLE_APP_STATE.background) {
      if (
        currentScreen.name !== SCREEN_NAME.splashScreen &&
        currentScreen.name !== SCREEN_NAME.loginScreen &&
        currentScreen.name !== SCREEN_NAME.lockedScreen &&
        !isGoHomeWithRememberMe
      ) {
        if (storage.getString(TIME_OUT.timeOut)) {
          const timeCurrent = new Date().getTime();
          if (timeCurrent - timeAtActive > 1000) {
            timeAtBackground = new Date().getTime();
            DAORepository.saveStackScreen(stacks);
            isTimeOut.current = true;
          } else {
            storage.set(TIME_OUT.timeOutState, false);
            isTimeOut.current = false;
          }
        } else {
          storage.set(TIME_OUT.timeOutState, false);
          isTimeOut.current = false;
        }
      } else {
        storage.set(TIME_OUT.timeOutState, false);
      }
    } else if (
      appState.current === LIFE_CYCLE_APP_STATE.background &&
      nextAppState === LIFE_CYCLE_APP_STATE.active &&
      isTimeOut.current
    ) {
      const timeOut = Number(storage.getString(TIME_OUT.timeOut));
      const timeNow = new Date();
      if (timeNow.getTime() - timeAtBackground >= timeOut) {
        if (Platform.OS === 'android') {
          ScannerModule.backPressedScannerActivity();
        } else {
          const QRCodeDismissed = NativeModules.ScreenDismissedModule;
          QRCodeDismissed.dismissScan();
        }

        storage.set(TIME_OUT.timeOutState, true);
        isTimeOut.current = false;

        navigation.reset({
          index: 0,
          routes: [{ name: SCREEN_NAME.splashScreen }],
        });
      } else {
        isTimeOut.current = false;
        storage.set(TIME_OUT.timeOutState, false);
      }
    } else {
      timeAtActive = new Date().getTime();
      isTimeOut.current = false;
      storage.set(TIME_OUT.timeOutState, false);
    }

    appState.current = nextAppState;
  };

  const handleRequestToPan = () => {
    if (isFinishTimeOut) {
      handleConnectFromDapp();
      dispatch(setFinishTimeOut(false));
    } else {
      if (
        (appState.current === LIFE_CYCLE_APP_STATE.active ||
          !appState.current) &&
        !storage.getBoolean(TIME_OUT.timeOutState)
      ) {
        handleConnectFromDapp();
      }
    }
  };

  useEffect(() => {
    const requestPan = setTimeout(() => {
      handleRequestToPan();
    }, 500);
    return () => {
      clearTimeout(requestPan);
    };
  }, [params, isFinishTimeOut]);

  useEffect(() => {
    const unSubscription = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        navigation.navigate(SCREEN_NAME.networkErrorScreen);
      }
    });

    return () => unSubscription;
  }, []);

  useEffect(() => {
    if (!netInfo.isConnected && goBackEvent) {
      setTimeout(() => {
        navigation.navigate(SCREEN_NAME.networkErrorScreen);
      }, 1000);
    }

    dispatch(setNavigationBackEvent(false));
  }, [goBackEvent]);

  useEffect(() => {
    NativeAsyncStorage.saveData(TIME_OUT.timeOutState, 'false');
    if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        CONSTANT_EVENT_EMITTER.lifeCycleApp,
        data => {
          handleEventListenLifeCycle(data.message);
        },
      );

      return () => {
        DeviceEventEmitter.removeAllListeners(
          CONSTANT_EVENT_EMITTER.lifeCycleApp,
        );
      };
    } else {
      const appStateModule = NativeModules.AppStateModule;
      appStateModule.addListener(LIFE_CYCLE_APP_STATE.background);
      appStateModule.addListener(LIFE_CYCLE_APP_STATE.active);
      const event = new NativeEventEmitter(appStateModule);

      const eventBackground = event.addListener(
        LIFE_CYCLE_APP_STATE.background,
        state => {
          handleEventListenLifeCycle(state.state);
        },
      );

      const eventActive = event.addListener(
        LIFE_CYCLE_APP_STATE.active,
        state => {
          handleEventListenLifeCycle(state.state);
        },
      );

      appStateModule.checkAppState();

      return () => {
        eventBackground.remove();
        eventActive.remove();
      };
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <BottomTabs />
    </View>
  );
};

const { ScannerModule } = NativeModules;

NavigationTabs.propTypes = {
  navigation: PropTypes.object,
};
export default NavigationTabs;
