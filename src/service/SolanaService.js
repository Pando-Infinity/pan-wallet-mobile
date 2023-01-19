import React, { useEffect } from 'react';

import { setupURLPolyfill } from 'react-native-url-polyfill';
import { derivePath } from 'ed25519-hd-key';
import * as encoding from 'text-encoding';
import nacl from 'tweetnacl';
// import { Metaplex } from '@metaplex-foundation/js-next';
import axios from 'axios';
import { View } from 'react-native';
import Config from 'react-native-config';
import { TOKEN_NAME } from '../constants';
const { Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');

setupURLPolyfill();
const connection = new Connection(clusterApiUrl(Config.SOL_MODE), 'confirmed');

export default class SolanaService {
  static getBalanceSOL = async address => {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9;
  };
}

export const showMetadata = async (
  // connection: Connection,
  mintAddress: string,
): Promise<any> => {
  const Metaplex = '';
  const metaplex = new Metaplex(connection);
  const mintKey = new PublicKey(mintAddress);
  try {
    return await metaplex.nfts().findByMint(mintKey);
  } catch (err) {
    return null;
  }
};

export const getAllNftOfUser = async (
  // connection: Connection,
  ownerAddress: string,
): Promise<any> => {
  Promise.allSettled =
    Promise.allSettled ||
    (promises =>
      Promise.all(
        promises.map(p =>
          p
            .then(value => ({
              status: 'fulfilled',
              value,
            }))
            .catch(reason => ({
              status: 'rejected',
              reason,
            })),
        ),
      ));
  const Metaplex = '';
  const metaplex = new Metaplex(connection);
  const ownerPublicKey = new PublicKey(ownerAddress);
  const allNftMetadata = await metaplex.nfts().findAllByOwner(ownerPublicKey);
  return allNftMetadata;
  // const uri = allNftMetadata[0].uri;
  // const result = await axios.get(uri);
  // return result.data;
};

export const getOwnerOfNft = async (
  // connection: Connection,
  mintAddress: string,
): Promise<string> => {
  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(mintAddress),
  );
  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0].address,
  );
  const ownerInfo = Object.create(largestAccountInfo.value);
  return ownerInfo.data.parsed.info.owner;
};

export const isValidateMintAddress = async address => {
  try {
    const publicKey = new PublicKey(address);
    // let accountInfo = await
    const rel = await connection.getParsedAccountInfo(publicKey);
    return rel.value.data.parsed.type === 'mint';
  } catch (e) {
    return false;
  }
};

export const isValidateMintAddressNFT = async (address, network) => {
  try {
    if (network === TOKEN_NAME.solana) {
      const publicKey = new PublicKey(address);
      const rel = await connection.getParsedAccountInfo(publicKey);
      if (rel.value.data.parsed.info.supply > 1) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};
