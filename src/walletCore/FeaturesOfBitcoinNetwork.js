import {apiBlockCypher} from './ConstApiUrl';
import {Networks} from 'bitcore-lib';

const bitcore = require('bitcore-lib');
const bip84 = require('bip84');
const bitcoin = require('bitcoinjs-lib');
const {Buffer} = require('buffer');

const unitConversionSatoshiToBitcoin = 100000000;
const balancePath = '/balance';

const generateAccount = mnemonic =>
  new Promise((resolve, reject) => {
    const account = {address: 'String', privateKey: 'String'};
    const root = new bip84.fromMnemonic(mnemonic, '', true);
    const child = root.deriveAccount(0);
    const accountRaw = new bip84.fromZPrv(child);
    account.address = accountRaw.getAddress(0);
    account.privateKey = accountRaw
      .getKeypair(0, false)
      .privateKey.toString('hex');
    resolve(account);
  });

const checkValidPrivateKey = privateKey => {
  return bitcore.PrivateKey.isValid(privateKey);
};

const generateAddressFromPrivateKey = privateKey =>
  new Promise(resolve => {
    const priKey = new bitcore.PrivateKey(privateKey);
    const publicKey = new bitcore.PublicKey(priKey);
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: new Buffer(publicKey.toString(), 'hex'),
    });
    resolve(address.toString());
  });

// export const getBalance = async address => {
//   const res = await fetch(apiBlockCypher + address + balancePath);
//   const result = await res.json();
//   return result.balance / unitConversionSatoshiToBitcoin;
// };

export default {
  generateAccount,
  checkValidPrivateKey,
  generateAddressFromPrivateKey,
};
