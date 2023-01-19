import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

const derivePathOfEthereum = "m/44'/60'/0'/0/0";

const generateAccount = mnemonic =>
  new Promise((resolve, reject) => {
    const account = { address: String, privateKey: String };
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const accountRaw = hdNode.derivePath(derivePathOfEthereum);
    account.address = accountRaw.address;
    account.privateKey = accountRaw.privateKey;
    resolve(account);
  });

const checkValidPrivateKey = privateKey => {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch (e) {
    return false;
  }
};

const generateAddressFromPrivateKey = privateKey =>
  new Promise(resolve => {
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;
    resolve(address);
  });

const setProvider = apiUrl => {
  return new ethers.providers.JsonRpcProvider(apiUrl);
};

const getBalance = async (provider, address) => {
  const balanceWei = await provider.getBalance(address);
  return parseFloat(formatUnits(balanceWei, 'ether')).toFixed(2);
};

const isValidETHAddress = address => {
  return ethers.utils.isAddress(address);
};

export default {
  generateAccount,
  checkValidPrivateKey,
  setProvider,
  generateAddressFromPrivateKey,
  getBalance,
  isValidETHAddress,
};
