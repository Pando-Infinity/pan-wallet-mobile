import { CONSTANTS, TOKEN_NAME } from '../constants';
import { storage } from 'databases/index';
import Constants from '../constants/constants';

export const saveListContract = (walletID, contractAddress) => {
  const listContractObject = storage.getString(
    `${Constants.listContractAdded}${walletID}`,
  );
  if (listContractObject !== undefined) {
    const json = JSON.parse(listContractObject);
    json.push(contractAddress);
    storage.set(
      `${Constants.listContractAdded}${walletID}`,
      JSON.stringify([...new Set(json)]),
    );
  } else {
    const listContractAdded = [];
    listContractAdded.push(contractAddress);
    storage.set(
      `${Constants.listContractAdded}${walletID}`,
      JSON.stringify([...new Set(listContractAdded)]),
    );
  }
};

export const getDataNftHome = async (walletID, walletChain) => {
  const nftETHObject = storage.getString(
    `${CONSTANTS.listNFTOfETHKey}${walletID}`,
  );
  const nftBSCObject = storage.getString(
    `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
  );
  const nftSOLObject = storage.getString(
    `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
  );
  const nftMultiChainObject = storage.getString(
    `${CONSTANTS.listNFTMultiChain}${walletID}`,
  );

  switch (walletChain) {
    case TOKEN_NAME.multiChain: {
      if (nftMultiChainObject !== undefined) {
        return JSON.parse(nftMultiChainObject);
      } else {
        return [];
      }
    }
    case TOKEN_NAME.ethereum: {
      if (nftETHObject !== undefined) {
        return JSON.parse(nftETHObject);
      } else {
        return [];
      }
    }
    case TOKEN_NAME.smartChain: {
      if (nftBSCObject !== undefined) {
        return JSON.parse(nftBSCObject);
      } else {
        return [];
      }
    }
    case TOKEN_NAME.solana: {
      if (nftSOLObject !== undefined) {
        return JSON.parse(nftSOLObject);
      } else {
        return [];
      }
    }
  }
};
