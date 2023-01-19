import { TOKEN_NAME, TABLE_NAME, TOKEN_SYMBOL } from 'constants';
import { DAORepository } from 'databases';
import { isBtcAddress, isSolAddress, isEthAddress } from 'walletCore/validate';

export const getWalletDataByWalletId = walletID => {
  let list = [];
  DAORepository.getAllData(TABLE_NAME.address_schema).then(val => {
    list = val.filter(item => {
      return item.idAccountWallet === walletID;
    });
  });

  return list[0].addressList;
};

export const getWalletInfoByNetwork = (type, walletId) => {
  let method = '';
  switch (type) {
    case TOKEN_NAME.ethereum:
    case TOKEN_NAME.smartChain:
      method = 'getEthereumById';
      break;
    case TOKEN_NAME.bitcoin:
      method = 'getBitcoinById';
      break;
    case TOKEN_NAME.solana:
      method = 'getSolanaById';
      break;
    default:
      break;
  }

  return method
    ? DAORepository[method](parseInt(walletId, 10)).then(wallet => wallet)
    : {};
};

export const isValidWalletAddressByNetwork = (address, type) => {
  switch (type) {
    case TOKEN_NAME.ethereum:
    case TOKEN_NAME.smartChain:
      return isEthAddress(address);
    case TOKEN_NAME.solana:
      return isSolAddress(address);
    case TOKEN_NAME.bitcoin:
      return isBtcAddress(address);
    default:
      return false;
  }
};

export const getWallet = async (walletID, address, chainWallet) => {
  try {
    const list = await DAORepository.getAllWallet();
    const wallet = list.find(item => item._id === walletID);
    const name = wallet.name;
    const walletType = wallet.chain;
    switch (chainWallet) {
      case TOKEN_SYMBOL.btc: {
        const walletBtc = await DAORepository.getAllBitcoin();
        const btc = walletBtc.find(item => item.address === address);
        btc.name = name;
        btc.walletType = walletType;
        return btc;
      }
      case TOKEN_SYMBOL.eth:
      case TOKEN_SYMBOL.bsc: {
        const walletErc = await DAORepository.getAllEthereum();
        const eth = walletErc.find(item => item.address === address);
        eth.name = name;
        eth.walletType = walletType;
        return eth;
      }
      case TOKEN_SYMBOL.sol: {
        const walletSol = await DAORepository.getAllSolana();
        const sol = walletSol.find(item => item.address === address);
        sol.name = name;
        sol.walletType = walletType;
        return sol;
      }
      default:
        return {};
    }
  } catch (error) {
    return {};
  }
};
