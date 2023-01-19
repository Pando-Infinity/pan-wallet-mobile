import { getDataNftHome } from 'walletCore/getDataNftHome';
import { CONSTANTS, TOKEN_NAME } from 'constants';
import { storage } from 'databases/index';
import Constants from '../../constants/constants';

export const handleRemoveNFT = async (
  walletID,
  walletChain,
  networkName,
  contractAddress,
  tokenId,
) => {
  const nfts = await getDataNftHome(walletID, walletChain);

  const removedNftIndex = nfts.findIndex(item => {
    if (networkName === TOKEN_NAME.solana) {
      return item.contract === contractAddress;
    } else {
      return item.token_id === tokenId;
    }
  });

  // Remove nft from list
  if (removedNftIndex !== -1) {
    const newNfts = [
      ...nfts.slice(0, removedNftIndex),
      ...nfts.slice(removedNftIndex + 1),
    ];

    switch (walletChain) {
      case TOKEN_NAME.multiChain: {
        storage.set(
          `${CONSTANTS.listNFTMultiChain}${walletID}`,
          JSON.stringify(newNfts),
        );
        break;
      }
      case TOKEN_NAME.ethereum: {
        storage.set(
          `${Constants.listNFTOfETHKey}${walletID}`,
          JSON.stringify(newNfts),
        );
        break;
      }
      case TOKEN_NAME.smartChain: {
        storage.set(
          `${Constants.listNFTOfBSCKey}${walletID}`,
          JSON.stringify(newNfts),
        );
        break;
      }
      case TOKEN_NAME.solana: {
        storage.set(
          `${Constants.listNFTOfSOLKey}${walletID}`,
          JSON.stringify(newNfts),
        );
        break;
      }
    }
  }

  const listCurrentContracts = nfts.filter(
    item => item.contract === contractAddress,
  );

  // Remove contract address
  if (listCurrentContracts.length === 1) {
    const listContractArr = JSON.parse(
      storage.getString(`${Constants.listContractAdded}${walletID}`),
    );
    const removedContractIndex = listContractArr.findIndex(
      item => item === contractAddress,
    );
    const newListContracts = [
      ...listContractArr.slice(0, removedContractIndex),
      ...listContractArr.slice(removedContractIndex + 1),
    ];

    storage.set(
      `${Constants.listContractAdded}${walletID}`,
      JSON.stringify([...new Set(newListContracts)]),
    );
  }
};
