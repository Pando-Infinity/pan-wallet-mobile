import { CONSTANTS, IMAGES, TOKEN_NAME, TOKEN_SYMBOL } from 'constants';
import { storage, DAORepository } from 'databases';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { GetBalance } from 'walletCore';

const COIN_INFO_LIST = [
  {
    asset_id: 'BTC',
    name: 'Bitcoin',
    image: IMAGES.btc_icon,
    type: 'coin',
    decimal: 8,
    coinSymbol: TOKEN_SYMBOL.btc,
    storeName: 'BTCData',
  },
  {
    asset_id: 'ETH',
    name: 'Ethereum',
    image: IMAGES.eth_icon,
    type: 'coin',
    decimal: 18,
    coinSymbol: TOKEN_SYMBOL.eth,
    chainId: CONSTANTS.chainIdList.eth,
    storeName: 'ETHData',
  },
  {
    asset_id: 'BSC',
    name: 'Smart Chain',
    image: IMAGES.bsc_icon,
    type: 'coin',
    decimal: 18,
    coinSymbol: TOKEN_SYMBOL.bnb,
    chainId: CONSTANTS.chainIdList.bsc,
    storeName: 'BSCData',
  },
  {
    asset_id: 'SOL',
    name: 'Solana',
    image: IMAGES.sol_icon,
    type: 'coin',
    decimal: 9,
    coinSymbol: TOKEN_SYMBOL.sol,
    storeName: 'SOLData',
  },
];

const setCoinData = async (
  address,
  id,
  price,
  change_percent_price,
  defaultData = {},
) => {
  const balance = await GetBalance.getCoinBalance(
    address,
    defaultData.coinSymbol,
  );
  const formatBalance = parseFloat(
    (balance / Math.pow(10, defaultData.decimal)).toFixed(5),
  );
  const { storeName, ...otherDefaultData } = defaultData;
  const data = {
    ...otherDefaultData,
    id_token: id,
    address,
    balance: formatBalance,
    price,
    change_percent_price,
    isShow: true,
  };
  storage.set(storeName, JSON.stringify(data));
};

export const getDataForItem = async (walletID, chain, fiatCurrency = 'usd') => {
  const address = await DAORepository.getListAddressTokenByWalletId(walletID);
  const priceInfoList = await Promise.all(
    COIN_INFO_LIST.map(async item => {
      const info = await getCoinInfoOnMarket(
        item.coinSymbol,
        fiatCurrency,
        item.name,
      );
      return {
        price: info?.[0]?.current_price || 0,
        change_percent_price: info?.[0]?.price_change_percentage_24h || 0,
      };
    }),
  );

  for (let i = 0; i < address.length; i++) {
    const item = address[i];
    const token = item.split('-');
    switch (chain) {
      case TOKEN_NAME.multiChain: {
        if (token[0] === TOKEN_NAME.bitcoin) {
          const bitcoin = await DAORepository.getBitcoinById(
            parseInt(token[1], 10),
          );
          const addressBTC = bitcoin.address;
          await setCoinData(
            addressBTC,
            parseInt(token[1], 10),
            priceInfoList[0].price,
            priceInfoList[0].change_percent_price,
            COIN_INFO_LIST[0],
          );
        }
        if (token[0] === TOKEN_NAME.ethereum) {
          const ethereum = await DAORepository.getEthereumById(
            parseInt(token[1], 10),
          );
          const addressETH = ethereum.address;
          const addressBSC = ethereum.address;
          await setCoinData(
            addressETH,
            parseInt(token[1], 10),
            priceInfoList[1].price,
            priceInfoList[1].change_percent_price,
            COIN_INFO_LIST[1],
          );
          await setCoinData(
            addressBSC,
            parseInt(token[1], 10),
            priceInfoList[2].price,
            priceInfoList[2].change_percent_price,
            COIN_INFO_LIST[2],
          );
          storage.set(CONSTANTS.addressOfETHKey, addressETH);
          storage.set(CONSTANTS.addressOfBSCKey, addressBSC);
        }
        if (token[0] === TOKEN_NAME.solana) {
          const solana = await DAORepository.getSolanaById(parseInt(token[1]));
          const addressSOL = solana.address;
          await setCoinData(
            addressSOL,
            parseInt(token[1], 10),
            priceInfoList[3].price,
            priceInfoList[3].change_percent_price,
            COIN_INFO_LIST[3],
          );
          storage.set(CONSTANTS.addressOfSOLKey, addressSOL);
        }
        break;
      }
      case TOKEN_NAME.bitcoin: {
        const bitcoin = await DAORepository.getBitcoinById(parseInt(token[1]));
        const addressBTC = bitcoin.address;
        await setCoinData(
          addressBTC,
          parseInt(token[1], 10),
          priceInfoList[0].price,
          priceInfoList[0].change_percent_price,
          COIN_INFO_LIST[0],
        );
        break;
      }
      case TOKEN_NAME.ethereum: {
        const ethereum = await DAORepository.getEthereumById(
          parseInt(token[1], 10),
        );
        const addressETH = ethereum.address;
        await setCoinData(
          addressETH,
          parseInt(token[1], 10),
          priceInfoList[1].price,
          priceInfoList[1].change_percent_price,
          COIN_INFO_LIST[1],
        );
        storage.set(CONSTANTS.addressOfETHKey, addressETH);
        break;
      }
      case TOKEN_NAME.smartChain: {
        const smartChain = await DAORepository.getEthereumById(
          parseInt(token[1], 10),
        );
        const addressBSC = smartChain.address;
        await setCoinData(
          addressBSC,
          parseInt(token[1], 10),
          priceInfoList[2].price,
          priceInfoList[2].change_percent_price,
          COIN_INFO_LIST[2],
        );
        storage.set(CONSTANTS.addressOfBSCKey, addressBSC);
        break;
      }
      case TOKEN_NAME.solana: {
        const solana = await DAORepository.getSolanaById(parseInt(token[1]));
        const addressSOL = solana.address;
        await setCoinData(
          addressSOL,
          parseInt(token[1], 10),
          priceInfoList[3].price,
          priceInfoList[3].change_percent_price,
          COIN_INFO_LIST[3],
        );
        storage.set(CONSTANTS.addressOfSOLKey, addressSOL);
        break;
      }
      default:
        break;
    }
  }
};

let multiChainData = [];
let BTCData = [];
let BSCData = [];
let ETHData = [];
let SOLData = [];

export const bindingDataForFlatList = (id, chainType) => {
  const jsonBTC = storage.getString('BTCData');
  const jsonBSC = storage.getString('BSCData');
  const jsonETH = storage.getString('ETHData');
  const jsonSOL = storage.getString('SOLData');

  let objectBTC = {
    id_token: 0,
    asset_id: '-',
    name: '-',
    type: '-',
    image: IMAGES.btc_icon,
    address: '-',
    balance: '-',
    price: '-',
    change_percent_price: '-',
    decimal: '-',
    isShow: true,
  };

  let objectETH = {
    id_token: 0,
    asset_id: '-',
    name: '-',
    type: '-',
    image: IMAGES.eth_icon,
    address: '-',
    balance: '-',
    price: '-',
    change_percent_price: '-',
    decimal: '-',
    chainId: CONSTANTS.chainIdList.eth,
    isShow: true,
  };

  let objectBSC = {
    id_token: 0,
    asset_id: '-',
    name: '-',
    type: '-',
    image: IMAGES.bsc_icon,
    address: '-',
    balance: '-',
    price: '-',
    change_percent_price: '-',
    decimal: '-',
    chainId: CONSTANTS.chainIdList.bsc,
    isShow: true,
  };

  let objectSOL = {
    id_token: 0,
    asset_id: '-',
    name: '-',
    type: '-',
    image: IMAGES.sol_icon,
    address: '-',
    balance: '-',
    price: '-',
    change_percent_price: '-',
    decimal: '-',
    isShow: true,
  };

  if (jsonBTC !== undefined) {
    objectBTC = {};
    objectBTC = JSON.parse(jsonBTC);
  }

  if (jsonETH !== undefined) {
    objectETH = {};
    objectETH = JSON.parse(jsonETH);
  }

  if (jsonBSC !== undefined) {
    objectBSC = {};
    objectBSC = JSON.parse(jsonBSC);
  }

  if (jsonSOL !== undefined) {
    objectSOL = {};
    objectSOL = JSON.parse(jsonSOL);
  }

  switch (chainType) {
    case TOKEN_NAME.multiChain: {
      multiChainData = [objectBTC, objectETH, objectBSC, objectSOL];
      storage.set(
        `${CONSTANTS.multiChainDataKey}${id}`,
        JSON.stringify(multiChainData),
      );
      break;
    }
    case TOKEN_NAME.bitcoin: {
      BTCData = [objectBTC];
      storage.set(`${CONSTANTS.BTCChainDataKey}${id}`, JSON.stringify(BTCData));
      break;
    }
    case TOKEN_NAME.ethereum: {
      ETHData = [objectETH];
      storage.set(`${CONSTANTS.ETHChainDataKey}${id}`, JSON.stringify(ETHData));
      break;
    }
    case TOKEN_NAME.smartChain: {
      BSCData = [objectBSC];
      storage.set(`${CONSTANTS.BSCChainDataKey}${id}`, JSON.stringify(BSCData));
      break;
    }
    case TOKEN_NAME.solana: {
      SOLData = [objectSOL];
      storage.set(`${CONSTANTS.SOLChainDataKey}${id}`, JSON.stringify(SOLData));
      break;
    }
    default:
      break;
  }
};
