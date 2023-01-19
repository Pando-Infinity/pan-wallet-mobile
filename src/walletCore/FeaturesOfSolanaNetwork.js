import { setupURLPolyfill } from 'react-native-url-polyfill';
import { derivePath } from 'ed25519-hd-key';
import * as encoding from 'text-encoding';
import nacl from 'tweetnacl';
import { NetworkMode } from '../models/NetworkMode';

setupURLPolyfill();

const solanaWeb3 = require('@solana/web3.js');
const connection = new solanaWeb3.Connection(NetworkMode.solana.main_net_beta);
const { Keypair, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

const bip39 = require('bip39');

const generateAccount = mnemonic =>
  new Promise(resolve => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const path = "m/44'/501'/0'/0'";
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    const account = {
      address: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
    };
    resolve(account);
  });

const checkValidPrivateKey = privateKey => {
  const secretKey = bs58.decode(privateKey);
  const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);
  const encoder = new encoding.TextEncoder();
  const signData = encoder.encode('@solana/web3.js-validation-v1');
  const signature = nacl.sign.detached(signData, keypair.secretKey);
  return nacl.sign.detached.verify(signData, signature, keypair.publicKey);
};

const generateAddressFromPrivateKey = privateKey =>
  new Promise((resolve, reject) => {
    const secretKey = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(secretKey, {
      skipValidation: true,
    });
    const address = keypair.publicKey.toBase58();
    resolve(address);
  });

const isValidateSOLAddress = address => {
  try {
    const publicKey = new PublicKey(address);
    const isSolana = PublicKey.isOnCurve(publicKey.toBuffer());
    return isSolana;
  } catch (e) {
    return false;
  }
};

export default {
  generateAccount,
  generateAddressFromPrivateKey,
  checkValidPrivateKey,
  isValidateSOLAddress,
};
