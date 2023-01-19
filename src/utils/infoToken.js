import { TOKEN_NAME, TOKEN_SYMBOL, TOKEN_TYPE } from '../constants';
import { providers } from 'ethers';
import Web3 from 'web3';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import stringFormat from 'components/StringFormat/StringFormat';
import Config from 'react-native-config';

const tokenInfo = async token => {
  const web3 = new Web3(providers[token.chainID]);
  const tokenInst = new web3.eth.Contract(ERC20TransferABI, token.address);
  const tokenID = await tokenInst.methods.decimal().call();
  const tokenName = await tokenInst.methods.name().call();
  const symbol = await tokenInst.methods.symbol().call();
  const logo = await tokenInst.methods.tokenLogoURL.call();
  return {
    id: tokenID,
    name: tokenName,
    symbol: symbol,
    logo: logo,
  };
};

export default tokenInfo;

export const ERC20TransferABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

export const getNetworkName = type => {
  const formattedType = String(type).toLowerCase();
  switch (formattedType) {
    case TOKEN_SYMBOL.btc:
      return TOKEN_NAME.bitcoin;
    case TOKEN_SYMBOL.bsc:
      return TOKEN_NAME.smartChain;
    case TOKEN_SYMBOL.sol:
      return TOKEN_NAME.solana;
    case TOKEN_SYMBOL.eth:
      return TOKEN_NAME.ethereum;
    case TOKEN_SYMBOL.multi:
      return TOKEN_NAME.multiChain;
    default:
      return '';
  }
};

export const getCoinSymbol = type => {
  let symbol = '';
  switch (type) {
    case TOKEN_NAME.bitcoin:
      symbol = TOKEN_SYMBOL.btc;
      break;
    case TOKEN_NAME.ethereum:
      symbol = TOKEN_SYMBOL.eth;
      break;
    case TOKEN_NAME.smartChain:
      symbol = TOKEN_SYMBOL.bnb;
      break;
    case TOKEN_NAME.solana:
      symbol = TOKEN_SYMBOL.sol;
      break;
    default:
      break;
  }

  return symbol.toUpperCase();
};

export const getTokenType = type => {
  switch (type) {
    case TOKEN_NAME.ethereum:
    case TOKEN_SYMBOL.eth:
      return TOKEN_TYPE.ERC20;

    case TOKEN_NAME.smartChain:
    case TOKEN_SYMBOL.bsc:
      return TOKEN_TYPE.BEP20;

    case TOKEN_NAME.solana:
    case TOKEN_SYMBOL.sol:
      return TOKEN_TYPE.SPL;

    case TOKEN_NAME.bitcoin:
    case TOKEN_SYMBOL.btc:
      return TOKEN_TYPE.BTC;

    default:
      return '';
  }
};

/**
 * Get coin info on market by firebase
 * @param {string|array} symbolList - symbol list of coin
 * @returns {array} is object contain name and id
 */
export const getCoinIds = async symbolList => {
  try {
    if (!Array.isArray(symbolList)) {
      const info = await firestore().collection('coins').doc(symbolList).get();
      return info.data().data;
    }
    let coinInfos = await Promise.all(
      symbolList.map(async symbol => {
        return await firestore().collection('coins').doc(symbol).get();
      }),
    );
    coinInfos = coinInfos.map(info => info.data().data);
    return coinInfos;
  } catch (error) {
    return [];
  }
};

export const getCoinInfoOnMarket = async (symbol, fiatCurrency, coinName) => {
  if (!fiatCurrency) return [];
  try {
    const coinList = await getCoinIds(symbol?.toLowerCase());
    let validCoinInfo = {};
    if (coinList.length === 1) {
      validCoinInfo = coinList[0];
    } else {
      validCoinInfo = coinList.find(
        ({ name }) =>
          name.toLowerCase() === coinName?.toLowerCase() ||
          name.toLowerCase() === symbol?.toLowerCase(),
      );
    }

    const response = await axios.get(
      stringFormat(Config.API_COINGECKO, [
        fiatCurrency.toLowerCase(),
        validCoinInfo.id,
      ]),
    );

    return response.data;
  } catch (error) {
    return [];
  }
};
