import Config from 'react-native-config';
import { CONSTANTS, STRINGS, TOKEN_NAME } from '../../constants';
import { EthereumService } from 'service/EthereumService';
import { NativeModules, Platform } from 'react-native';
import { getOwnerOfNft } from 'service/SolanaService';
import Metaplex from '../Metaplex';
import axios from 'axios';
import { storage } from 'databases/index';
import Constants from '../../constants/constants';
import { saveListContract } from 'walletCore/getDataNftHome';
import { setNftErrorLabel } from 'stores/reducer/nftErrorSlice';

const Web3 = require('web3');

const web3ETH = new Web3(Config.ETH_END_POINT);
const web3BSC = new Web3(Config.BSC_END_POINT);

const convertIpfsURL = url => {
  if (url) {
    const hash = String(url).replace('ipfs://', '');
    const hashEndPoint = '.ipfs.dweb.link/';
    return 'https://' + hash + hashEndPoint;
  } else {
    return null;
  }
};

const renderObjMetadata = async (
  contractAddress,
  ownerAddress,
  tokenId,
  chain,
  data,
) => {
  try {
    if (String(data.uri).slice(0, 5) === 'ipfs:') {
      const ipfsURL = convertIpfsURL(data.uri);
      const nft = await axios.get(ipfsURL);
      return {
        contract: contractAddress,
        token_id: tokenId,
        token_tracker: data.name ?? '',
        symbol: data.symbol ?? '',
        name: nft.data.name ?? 'ERC721',
        description: nft.data.description ?? '',
        image: convertIpfsURL(nft.data.image) ?? '',
        animation_url: convertIpfsURL(nft.data.animation_url) ?? '',
        owner: ownerAddress,
        network: chain,
      };
    } else {
      const nft = await axios.get(data.uri);
      return {
        contract: contractAddress,
        token_id: tokenId,
        token_tracker: data.name ?? '',
        symbol: data.symbol ?? '',
        name: nft.data.name ?? 'ERC721',
        description: nft.data.description ?? '',
        image: nft.data.url ?? '',
        animation_url: '',
        owner: ownerAddress,
        network: chain,
      };
    }
  } catch {
    return {
      contract: contractAddress,
      token_id: tokenId,
      token_tracker: data.name ?? '',
      symbol: data.symbol ?? '',
      name: 'ERC721',
      description: '',
      image: null,
      animation_url: '',
      owner: ownerAddress,
      network: chain,
    };
  }
};

const renderObjMetadataSOL = async (
  contractAddress,
  tokenId,
  ownerAddress,
  chain,
  result,
  translate,
  disPatch,
) => {
  const data = await result;
  if (data === '') {
    disPatch(setNftErrorLabel(translate(STRINGS.unableToAddNFT)));
  } else {
    if (Platform.OS === 'android') {
      try {
        const nft = await axios.get(data[0].uri);

        return {
          contract: contractAddress,
          token_id: tokenId ?? '',
          token_tracker:
            data[0].name !== '' &&
            data[0].name !== undefined &&
            data[0].name !== null
              ? data[0].name
              : contractAddress,
          symbol: data[0].symbol ?? '',
          name: nft.data.name ?? 'SLP',
          description: nft.data.description ?? '',
          image: nft.data.image ?? '',
          animation_url: '',
          owner: ownerAddress,
          network: chain,
        };
      } catch {
        return {
          contract: contractAddress,
          token_id: tokenId ?? '',
          token_tracker:
            data[0].name !== '' &&
            data[0].name !== undefined &&
            data[0].name !== null
              ? data[0].name
              : contractAddress,
          symbol: data[0].symbol ?? '',
          name: 'SLP',
          description: '',
          image: null,
          animation_url: '',
          owner: ownerAddress,
          network: chain,
        };
      }
    } else {
      try {
        const nft = await axios.get(data.uri);
        return {
          contract: contractAddress,
          token_id: tokenId,
          name: nft.data.name ?? 'SPL',
          token_tracker:
            data.name !== '' && data.name !== undefined && data.name !== null
              ? data.name
              : contractAddress,
          symbol: data.symbol ?? '',
          description: nft.data.description ?? '',
          image: nft.data.image ?? '',
          animation_url: '',
          owner: ownerAddress,
          network: chain,
        };
      } catch {
        return {
          contract: contractAddress,
          token_id: tokenId,
          name: 'SLP',
          token_tracker:
            data.name !== '' && data.name !== undefined && data.name !== null
              ? data.name
              : contractAddress,
          symbol: data.symbol ?? '',
          description: '',
          image: null,
          animation_url: '',
          owner: ownerAddress,
          network: chain,
        };
      }
    }
  }
};

const CheckAndSaveNft = (
  chain,
  object,
  walletID,
  contract,
  token_id,
  translate,
  disPatch,
) => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      const listContractObject = storage.getString(
        `${Constants.listNFTMultiChain}${walletID}`,
      );
      if (listContractObject !== undefined) {
        const json = JSON.parse(listContractObject);
        const data = json.filter(value => {
          return value.contract === contract && value.token_id === token_id;
        });
        if (data.length !== 0) {
          disPatch(setNftErrorLabel(translate(STRINGS.duplicate_NFT_title)));
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTMultiChain}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
          disPatch(setNftErrorLabel(translate(STRINGS.ok)));
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTMultiChain}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
        disPatch(setNftErrorLabel(translate(STRINGS.ok)));
      }
      break;
    }
    case TOKEN_NAME.ethereum: {
      const nftETHObject = storage.getString(
        `${CONSTANTS.listNFTOfETHKey}${walletID}`,
      );

      if (nftETHObject !== undefined) {
        const json = JSON.parse(nftETHObject);
        const data = json.filter(value => {
          return value.contract === contract && value.token_id === token_id;
        });
        if (data.length !== 0) {
          disPatch(setNftErrorLabel(translate(STRINGS.duplicate_NFT_title)));
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfETHKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
          disPatch(setNftErrorLabel(translate(STRINGS.ok)));
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfETHKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
        disPatch(setNftErrorLabel(translate(STRINGS.ok)));
      }
      break;
    }
    case TOKEN_NAME.smartChain: {
      const nftBSCObject = storage.getString(
        `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
      );

      if (nftBSCObject !== undefined) {
        const json = JSON.parse(nftBSCObject);
        const data = json.filter(value => {
          return value.contract === contract && value.token_id === token_id;
        });
        if (data.length !== 0) {
          disPatch(setNftErrorLabel(translate(STRINGS.duplicate_NFT_title)));
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
          disPatch(setNftErrorLabel(translate(STRINGS.ok)));
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
        disPatch(setNftErrorLabel(translate(STRINGS.ok)));
      }
      break;
    }
    case TOKEN_NAME.solana: {
      const nftSOLObject = storage.getString(
        `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
      );
      if (nftSOLObject !== undefined) {
        const json = JSON.parse(nftSOLObject);
        const data = json.filter(value => {
          return value.contract === contract;
        });
        if (data.length !== 0) {
          disPatch(setNftErrorLabel(translate(STRINGS.duplicate_NFT_title)));
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
          disPatch(setNftErrorLabel(translate(STRINGS.ok)));
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
        disPatch(setNftErrorLabel(translate(STRINGS.ok)));
      }
      break;
    }
  }
};

export const getNftByOwner = async (
  chain,
  walletID,
  contractAddress,
  ownerAddress,
  tokenId,
  network,
  translate,
  disPatch,
) => {
  switch (network) {
    case TOKEN_NAME.ethereum: {
      try {
        const owner = await EthereumService.getOwnerOfNFTWeb3(
          web3ETH,
          contractAddress,
          tokenId,
        );
        if (owner !== ownerAddress) {
          disPatch(
            setNftErrorLabel(translate(STRINGS.unable_to_verify_ownership)),
          );
          break;
        } else {
          const data = await EthereumService.getMetadataWeb3(
            web3ETH,
            contractAddress,
            tokenId,
          );
          const object = await renderObjMetadata(
            contractAddress,
            ownerAddress,
            tokenId,
            network,
            data,
          );
          CheckAndSaveNft(
            chain,
            object,
            walletID,
            contractAddress,
            tokenId,
            translate,
            disPatch,
          );
          break;
        }
      } catch {
        disPatch(setNftErrorLabel(translate(STRINGS.unableToAddNFT)));
        break;
      }
    }
    case TOKEN_NAME.smartChain: {
      try {
        const owner = await EthereumService.getOwnerOfNFTWeb3(
          web3BSC,
          contractAddress,
          tokenId,
        );
        if (owner !== ownerAddress) {
          disPatch(
            setNftErrorLabel(translate(STRINGS.unable_to_verify_ownership)),
          );
          break;
        } else {
          const data = await EthereumService.getMetadataWeb3(
            web3BSC,
            contractAddress,
            tokenId,
          );
          const object = await renderObjMetadata(
            contractAddress,
            ownerAddress,
            tokenId,
            network,
            data,
          );
          CheckAndSaveNft(
            chain,
            object,
            walletID,
            contractAddress,
            tokenId,
            translate,
            disPatch,
          );
          break;
        }
      } catch (errr) {
        disPatch(setNftErrorLabel(translate(STRINGS.unableToAddNFT)));
        break;
      }
    }
    case TOKEN_NAME.solana: {
      //metaplex native module ios
      if (Platform.OS === 'ios') {
        const metaplexModule = NativeModules.MetaplexModule;
        try {
          const owner = await getOwnerOfNft(contractAddress);
          if (owner === ownerAddress) {
            const result = new Promise(function (resolve, reject) {
              metaplexModule.findNftByMint(
                contractAddress,
                Config.SOL_MODE,
                data => {
                  if (data === '') {
                    resolve('');
                  } else {
                    resolve(data);
                  }
                },
              );
            });
            const object = await renderObjMetadataSOL(
              contractAddress,
              tokenId,
              ownerAddress,
              network,
              result,
              translate,
              disPatch,
            );
            CheckAndSaveNft(
              chain,
              object,
              walletID,
              contractAddress,
              tokenId,
              translate,
              disPatch,
            );
            break;
          } else {
            disPatch(
              setNftErrorLabel(translate(STRINGS.unable_to_verify_ownership)),
            );
            break;
          }
        } catch {
          disPatch(setNftErrorLabel(translate(STRINGS.unableToAddNFT)));
          break;
        }
      } else {
        //metaplex native module android
        const owner = await getOwnerOfNft(contractAddress);
        if (owner !== ownerAddress) {
          disPatch(
            setNftErrorLabel(translate(STRINGS.unable_to_verify_ownership)),
          );
          break;
        } else {
          const metaplex = new Metaplex(Config.SOL_MODE, ownerAddress);
          const result = new Promise(function (resolve, reject) {
            metaplex
              .findAllByMintList(contractAddress)
              .then(data => {
                resolve(data);
              })
              .catch(() => resolve(''));
          });
          const object = await renderObjMetadataSOL(
            contractAddress,
            tokenId,
            ownerAddress,
            network,
            result,
            translate,
            disPatch,
          );
          CheckAndSaveNft(
            chain,
            object,
            walletID,
            contractAddress,
            tokenId,
            translate,
            disPatch,
          );
          break;
        }
      }
    }
  }
};
