import Clipboard from '@react-native-clipboard/clipboard';
import { Platform, ToastAndroid } from 'react-native';
import {
  COLOR,
  STRINGS,
  SIZES,
  TOKEN_SYMBOL,
  IMAGES,
  NETWORK_NAME,
  TOKEN_NAME,
  CONSTANTS,
  TIME_OUT,
  SCREEN_NAME,
  TRANSACTION,
  TABLE_NAME,
  TOKEN_TYPE,
} from 'constants';
import Toast from 'react-native-root-toast';
import storage from 'databases/AsyncStorage';
import { DAORepository } from 'databases/index';
import { ReceiveIcon, SendIcon, SwapIcon } from 'icons';
import Web3 from 'web3';
import { rpc } from 'constants/walletConst';
import * as solanaWeb3 from '@solana/web3.js';
import { ethers } from 'ethers';
import { setFinishTimeOut } from 'stores/reducer/isFinishTimeoutSlice';

/* eslint-disable no-case-declarations */
const convertStringToByteArray = string => {
  String.prototype.encodeHex = function () {
    const bytes = [];
    for (let i = 0; i < this.length; ++i) {
      bytes.push(this.charCodeAt(i));
    }
    return bytes;
  };
  return string.encodeHex();
};

export const copyTextToClipboard = (t, text) => {
  Clipboard.setString(text);

  if (Platform.OS === 'android') {
    ToastAndroid.show(t(STRINGS.copy_to_clipboard), ToastAndroid.SHORT);
  } else {
    const toast = Toast.show(t(STRINGS.copy_to_clipboard), {
      duration: Toast.durations.LONG,
      position: -SIZES.height * 0.1,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: COLOR.white,
      textColor: COLOR.black,
    });

    setTimeout(function () {
      Toast.hide(toast);
    }, 2000);
  }
};

export const makeURL = (schema, path, params) => {
  return schema + path + new URLSearchParams(params).toString();
};

export const compactAddress = val => {
  if (!val) {
    return '';
  }
  const length = val.length;
  return val.substring(0, 4) + '...' + val.substring(length - 4, length);
};

export default {
  convertStringToByteArray,
  makeURL,
  compactAddress,
};

export const getChainIcon = chain => {
  switch (chain) {
    case TOKEN_SYMBOL.btc:
    case NETWORK_NAME.bitcoinWallet:
    case TOKEN_NAME.bitcoin:
      return IMAGES.btc_icon;
    case TOKEN_SYMBOL.eth:
    case NETWORK_NAME.ethereumWallet:
    case TOKEN_NAME.ethereum:
      return IMAGES.eth_icon;
    case TOKEN_SYMBOL.sol:
    case NETWORK_NAME.solanaWallet:
    case TOKEN_NAME.solana:
      return IMAGES.sol_icon;
    case TOKEN_SYMBOL.multi:
    case NETWORK_NAME.multiChainWallet:
    case TOKEN_NAME.multiChain:
      return IMAGES.multi_chain;
    case TOKEN_SYMBOL.bsc:
    case NETWORK_NAME.bscWallet:
    case TOKEN_NAME.smartChain:
      return IMAGES.bsc_icon;
    default:
      return '';
  }
};

export const getChainName = chain => {
  switch (chain) {
    case TOKEN_SYMBOL.btc:
      return NETWORK_NAME.bitcoinWallet;
    case CONSTANTS.chainIdList.eth:
    case TOKEN_SYMBOL.eth:
      return NETWORK_NAME.ethereumWallet;
    case TOKEN_SYMBOL.sol:
      return NETWORK_NAME.solanaWallet;
    case TOKEN_SYMBOL.multi:
      return NETWORK_NAME.multiChainWallet;
    case CONSTANTS.chainIdList.bsc:
    case TOKEN_SYMBOL.bsc:
      return NETWORK_NAME.bscWallet;
    default:
      return '';
  }
};

// Get wallet list with activated wallet by chain id
export const getWalletInfoActivatedByChainId = (id, chain) => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      return storage.getString(`${CONSTANTS.newDataMultiChain}${id}`);
    }
    case TOKEN_NAME.bitcoin: {
      return storage.getString(`${CONSTANTS.newDataBTCChain}${id}`);
    }
    case TOKEN_NAME.ethereum: {
      return storage.getString(`${CONSTANTS.newDataETHChain}${id}`);
    }
    case TOKEN_NAME.smartChain: {
      return storage.getString(`${CONSTANTS.newDataBSCChain}${id}`);
    }
    case TOKEN_NAME.solana: {
      return storage.getString(`${CONSTANTS.newDataSOLChain}${id}`);
    }
    default:
      return {};
  }
};

// Get wallet list with all wallet by chain id
export const checkChainToBindingData = (id, chain) => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      return storage.getString(`${CONSTANTS.multiChainDataKey}${id}`);
    }
    case TOKEN_NAME.bitcoin: {
      return storage.getString(`${CONSTANTS.BTCChainDataKey}${id}`);
    }
    case TOKEN_NAME.ethereum: {
      return storage.getString(`${CONSTANTS.ETHChainDataKey}${id}`);
    }
    case TOKEN_NAME.smartChain: {
      return storage.getString(`${CONSTANTS.BSCChainDataKey}${id}`);
    }
    case TOKEN_NAME.solana: {
      return storage.getString(`${CONSTANTS.SOLChainDataKey}${id}`);
    }
    default:
      return {};
  }
};

export const getCurrentWalletChain = () => {
  return storage.getString(CONSTANTS.firstChainTypeKey);
};

export const getWalletId = () => {
  return storage.getNumber(CONSTANTS.rememberWalletIDKey) ?? 1;
};

export const getWalletChain = () => {
  return storage.getString(CONSTANTS.rememberWalletChainKey) !== undefined
    ? storage.getString(CONSTANTS.rememberWalletChainKey)
    : getCurrentWalletChain();
};

export const pushScreenTimeOut = (navigation, disPatch) => {
  if (storage.getBoolean(TIME_OUT.timeOutState)) {
    DAORepository.getStackScreen().then(stacks => {
      stacks.forEach(screen => {
        if (
          screen.name !== SCREEN_NAME.deleteSuccessScreen &&
          screen.name !== SCREEN_NAME.networkErrorScreen
        ) {
          navigation.push(screen.name, screen.params, screen.state);
        }
      });

      storage.set(TIME_OUT.timeOutState, false);
      disPatch(setFinishTimeOut(true));
    });
  } else {
    navigation.navigate(SCREEN_NAME.navigationBottomTab);
  }
};

export const getTransactionIcon = type => {
  switch (type) {
    case TRANSACTION.send:
      return SendIcon;
    case TRANSACTION.swap:
      return SwapIcon;
    case TRANSACTION.receive:
      return ReceiveIcon;
    default:
      return;
  }
};

export const getProvider = type => {
  switch (type) {
    case TOKEN_SYMBOL.eth:
    case TOKEN_TYPE.ERC20:
    case CONSTANTS.chainIdList.eth:
      return new Web3(rpc.eth);

    case TOKEN_SYMBOL.bsc:
    case TOKEN_TYPE.BEP20:
    case CONSTANTS.chainIdList.bsc:
      return new Web3(rpc.bsc);

    case TOKEN_SYMBOL.sol:
    case TOKEN_TYPE.SPL:
      const solana = new solanaWeb3.Connection(rpc.sol, 'finalized');
      return solana;

    case TOKEN_SYMBOL.btc:
    case TOKEN_TYPE.BTC:
    default:
      return {};
  }
};

export const getPrivateKey = async walletID => {
  if (typeof walletID === 'undefined') {
    return '';
  }
  const walletList = await DAORepository.getAllWallet();
  const currentWalletInfo = walletList.find(({ _id }) => _id === walletID);
  let privateKey = currentWalletInfo.privateKey;
  if (!privateKey) {
    const walletInfo = await DAORepository.getEthereumById(parseInt(walletID));
    privateKey = walletInfo.privateKey;
  }
  return privateKey;
};

export const estimateGas = async (chainId, transaction) => {
  if (!chainId || typeof transaction !== 'object') {
    return '';
  }
  let currentRpc;
  switch (chainId) {
    case CONSTANTS.chainIdList.eth:
      currentRpc = rpc.eth;
      break;
    case CONSTANTS.chainIdList.bsc:
      currentRpc = rpc.bsc;
      break;
  }
  const provider = new ethers.providers.JsonRpcProvider(currentRpc);
  const gas = await provider.estimateGas({
    ...transaction,
    value: 0,
  });
  return gas._hex;
};

export const getAddress = (walletID, type, setWallet) => {
  DAORepository.getAllData(TABLE_NAME.address_schema).then(val => {
    const walletData = val.filter(item => {
      return item.idAccountWallet === walletID;
    })[0].addressList;
    switch (type) {
      case 'ERC20':
      case 'BEP20':
        for (const element of walletData) {
          const [coin, id] = element.split('-');
          if (coin === TOKEN_NAME.ethereum || coin === TOKEN_NAME.smartChain) {
            DAORepository.getEthereumById(parseInt(id)).then(setWallet);
            return;
          }
        }
        break;
      case 'BTC':
        for (const element of walletData) {
          const [coin, id] = element.split('-');
          if (coin === TOKEN_NAME.bitcoin) {
            DAORepository.getBitcoinById(parseInt(id)).then(setWallet);
            return;
          }
        }
        break;
      case 'SPL':
        for (const element of walletData) {
          const [coin, id] = element.split('-');
          if (coin === TOKEN_NAME.solana) {
            DAORepository.getSolanaById(parseInt(id)).then(setWallet);
            return;
          }
        }
        break;
    }
  });
};

export const getContractSymbol = chainId => {
  switch (chainId) {
    case CONSTANTS.chainIdList.eth:
      return 'ERC20';
    case CONSTANTS.chainIdList.bsc:
      return 'BEP20';
    default:
      return '';
  }
};

export const formatPriceChangePercentage24h = price => {
  if (typeof price === 'string' || typeof price === 'number') {
    const forwardNumber = price > 0 ? '+' : '-';
    const newPrice = Math.round(price * 100) / 100;
    return `${newPrice < 0 ? '' : forwardNumber}${newPrice}%`;
  }
  return '-- %';
};

export const removeItemOnce = (arr, value) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

/**
 * Determine if a variable is 'undefined' or 'null'
 */
export const isUndefinedOrNull = value => {
  return value === null || value === undefined;
};
