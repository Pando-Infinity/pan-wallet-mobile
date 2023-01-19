import 'react-native-get-random-values';

const bip39 = require('bip39');

export const generateMnemonic = () => {
  return bip39.generateMnemonic();
};

export const checkValidate = mnemonic => {
  return bip39.validateMnemonic(mnemonic);
};

export default {
  generateMnemonic,
  checkValidate,
};
