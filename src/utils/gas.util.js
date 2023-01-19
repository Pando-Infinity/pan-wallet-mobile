import { GasOptions, GAS_STATUS } from 'models/GasOptions';
import {
  defaultGasLimit,
  defaultEthGasPrice,
  tokenGasLimit,
} from 'constants/walletConst';
import Web3 from 'web3';
import { TOKEN_NAME, TOKEN_TYPE, TOKEN_SYMBOL, CONSTANTS } from 'constants';
import Config from 'react-native-config';
import { STRINGS } from 'constants';
import { getGasLimit } from 'utils/blockchain';
import { ethers } from 'ethers';
import { storage } from 'databases/index';

/**
 * Get array of gas info by token type
 * @param {String} type - Token type
 *
 * @return {Array} Gas option
 */
export const getGasOptionByNetwork = type => {
  switch (type) {
    case TOKEN_NAME.bitcoin:
    case TOKEN_TYPE.BTC:
    case TOKEN_SYMBOL.btc:
      return GasOptions.btc;

    case TOKEN_NAME.ethereum:
    case TOKEN_TYPE.ERC20:
    case TOKEN_SYMBOL.eth:
      return GasOptions.eth;

    case TOKEN_NAME.smartChain:
    case TOKEN_TYPE.BEP20:
    case TOKEN_SYMBOL.bsc:
      return GasOptions.bsc;

    case TOKEN_NAME.solana:
    case TOKEN_TYPE.SPL:
    case TOKEN_SYMBOL.sol:
      return GasOptions.sol;
    default:
      return [];
  }
};

export const getTransactionFeeByType = async (type, gasOption = {}) => {
  switch (type) {
    case TOKEN_NAME.bitcoin:
    case TOKEN_NAME.solana:
    case TOKEN_SYMBOL.sol:
    case TOKEN_SYMBOL.btc:
      return { transactionFee: gasOption.tip };

    case TOKEN_NAME.ethereum:
    case TOKEN_TYPE.ERC20:
    case TOKEN_SYMBOL.eth: {
      const ethGasBase =
        storage.getNumber(CONSTANTS.ethGasPrice) ?? (await getFeeData());
      const gasFee =
        (Number(gasOption.tip) + Number(ethGasBase / 1e9) ||
          defaultEthGasPrice) * defaultGasLimit;

      return { transactionFee: Number(gasFee, 10) };
    }

    case TOKEN_NAME.smartChain:
    case TOKEN_TYPE.BEP20:
    case TOKEN_SYMBOL.bsc:
      const gasPrice = await getGasPrice(TOKEN_NAME.smartChain);
      return {
        transactionFee: tokenGasLimit * (gasPrice / 1e9 + gasOption.tip) * 1e9,
        gasPrice: (gasPrice / 1e9 + gasOption.tip) * 1e9,
      };
    default:
      return null;
  }
};

export const getChainInfoByType = type => {
  switch (type) {
    case 'BTC':
      return {
        decimals: 8,
        symbol: 'BTC',
      };
    case 'SPL':
      return {
        decimals: 9,
        symbol: 'SOL',
      };
    case 'ERC20':
    case 'ETH': {
      return {
        decimals: 18,
        symbol: 'ETH',
      };
    }
    case 'BEP20':
    case 'BNB':
      return {
        decimals: 18,
        symbol: 'BNB',
      };
    default:
      return {};
  }
};

export const getGasStatusLabel = (getLabel, gasStatus) => {
  let label = '';
  switch (gasStatus) {
    case GAS_STATUS.verySlow:
      label = STRINGS.verySlow;
      break;
    case GAS_STATUS.slow:
      label = STRINGS.slow;
      break;
    case GAS_STATUS.fast:
      label = STRINGS.fast;
      break;
    case GAS_STATUS.medium:
      label = STRINGS.gasMedium;
      break;
    case GAS_STATUS.superFast:
      label = STRINGS.superFast;
      break;
    case GAS_STATUS.gasWar:
      label = STRINGS.gasWar;
      break;
    case GAS_STATUS.starWar:
      label = STRINGS.starWar;
      break;
  }
  return getLabel(label);
};

export const getGasPrice = async chainSymbol => {
  if (chainSymbol === 'ETH') {
    const web3 = new Web3(Config.ETH_END_POINT);
    return await web3.eth.getGasPrice();
  } else {
    const web3 = new Web3(Config.BSC_END_POINT);
    return await web3.eth.getGasPrice();
  }
};
export const getFeeData = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(Config.ETH_END_POINT);
    const feeData = await provider.getFeeData();
    const dataString = JSON.stringify(feeData);
    const dataJson = JSON.parse(dataString);
    const lastBaseFeePerGas = dataJson.lastBaseFeePerGas.hex;
    return parseInt(lastBaseFeePerGas, 16);
  } catch (error) {
    return 0;
  }
};
