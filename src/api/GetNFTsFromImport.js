import axios from 'axios';
import { CONSTANTS, TOKEN_NAME } from '../constants';
import stringFormat from 'components/StringFormat/StringFormat';
import Config from 'react-native-config';
import { headerConfigApiNFTs } from '../constants/walletConst';
import { storage } from 'databases/index';
import { Alert } from 'react-native';
import { STRINGS } from '../constants';
import { getOwnerOfNft } from 'service/SolanaService';
import Constants from '../constants/constants';
import { saveListContract } from 'walletCore/getDataNftHome';

const checkDuplicateNft = (
  chain,
  object,
  walletID,
  contract,
  token_id,
  translate,
  check,
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
        if (data.length !== 0 && check) {
          DuplicateNFTView(translate);
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTMultiChain}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTMultiChain}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
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
        if (data.length !== 0 && check) {
          DuplicateNFTView(translate);
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfETHKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfETHKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
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
        if (data.length !== 0 && check) {
          DuplicateNFTView(translate);
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfBSCKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
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
        if (data.length !== 0 && check) {
          DuplicateNFTView(translate);
        } else {
          json.push(object);
          storage.set(
            `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
            JSON.stringify(json),
          );
          saveListContract(walletID, contract);
        }
      } else {
        const listNFT = [];
        listNFT.push(object);
        storage.set(
          `${CONSTANTS.listNFTOfSOLKey}${walletID}`,
          JSON.stringify(listNFT),
        );
        saveListContract(walletID, contract);
      }
      break;
    }
  }
};

const getMetaDataWeb3Method = async (
  nft,
  tokenID,
  chain,
  owner,
  contractAddress,
  key,
  walletID,
  networkName,
  translate,
) => {
  const dataTotal = nft.data.total;

  if (parseInt(dataTotal, 10) === 0) {
    UnableToAddNFT(translate);
  } else {
    const size =
      parseInt(dataTotal, 10) < parseInt(CONSTANTS.pageSize, 10)
        ? parseInt(dataTotal, 10)
        : parseInt(CONSTANTS.pageSize, 10);

    for (let i = 0; i < size; i++) {
      try {
        const data = await axios.get(nft.data.result[i].token_uri);
        const object = {
          contract: contractAddress,
          token_id: nft.data.result[i].token_id,
          token_tracker: nft.data.result[i].name ?? contractAddress,
          name: data.data.name ?? nft.data.result[i].contract_type,
          symbol: nft.data.result[i].symbol ?? '',
          description: data.data.description ?? '',
          image: data.data.image,
          animation_url: data.data.animation_url ?? '',
          owner: owner,
          network: networkName,
        };

        checkDuplicateNft(
          chain,
          object,
          walletID,
          contractAddress,
          nft.data.result[i].token_id,
          translate,
          false,
        );
      } catch (error) {
        const object = {
          contract: contractAddress,
          token_id: nft.data.result[i].token_id,
          token_tracker: nft.data.result[i].name ?? contractAddress,
          name: nft.data.result[i].contract_type,
          symbol: nft.data.result[i].symbol ?? '',
          description: '',
          image: null,
          animation_url: '',
          owner: owner,
          network: networkName,
        };

        checkDuplicateNft(
          chain,
          object,
          walletID,
          contractAddress,
          nft.data.result[i].token_id,
          translate,
          false,
        );
      }
    }
  }
};

const getNFTsSOL = async (
  nft,
  mint,
  owner,
  walletID,
  chain,
  networkName,
  translate,
) => {
  const ownerAddress = await getOwnerOfNft(mint);
  if (ownerAddress !== owner) {
    UnableToAddNFT(translate);
  } else {
    await getMetadataNftSOL(
      nft,
      mint,
      owner,
      walletID,
      chain,
      networkName,
      translate,
    );
  }
};

const getMetadataNftSOL = async (
  nft,
  mintAddress,
  owner,
  walletID,
  chain,
  networkName,
  translate,
) => {
  try {
    const result = await axios.get(nft.data.metaplex.metadataUri);
    const object = {
      contract: mintAddress,
      token_id: '',
      token_tracker: nft.data.name ?? '',
      symbol: nft.data.symbol ?? '',
      name: nft.data.name ?? '',
      description: result.data.description ?? '',
      image: result.data.image ?? null,
      animation_url: result.data.animation_url ?? '',
      owner: owner,
      network: networkName,
    };
    checkDuplicateNft(
      chain,
      object,
      walletID,
      mintAddress,
      '',
      translate,
      true,
    );
  } catch (e) {
    const object = {
      contract: mintAddress,
      token_id: '',
      token_tracker: nft.data.name ?? '',
      symbol: nft.data.symbol ?? '',
      name: nft.data.name ?? '',
      description: '',
      image: null,
      animation_url: '',
      owner: owner,
      network: networkName,
    };
    checkDuplicateNft(
      chain,
      object,
      walletID,
      mintAddress,
      '',
      translate,
      true,
    );
  }
};

const getNFTWithOnlyContractWeb3 = async (
  config,
  cursor,
  nft,
  ownerAddress,
  contractAddress,
  tokenID,
  chain,
  key,
  walletID,
  networkName,
  networkMode,
  translate,
) => {
  try {
    nft = await axios.get(
      stringFormat(Config.SERVER_URL, [
        `${ownerAddress}`,
        `${contractAddress}`,
        `${networkMode}`,
        cursor,
      ]),
      { headers: config },
    );
  } catch (e) {
    nft = null;
    ApiError(translate);
  }
  if (nft !== null) {
    const cursorPage = nft.data.cursor ?? '';
    await storage.set(
      `${Constants.cursor}${walletID}${contractAddress}`,
      cursorPage,
    );
    await getMetaDataWeb3Method(
      nft,
      tokenID,
      chain,
      ownerAddress,
      contractAddress,
      key,
      walletID,
      networkName,
      translate,
    );
  }
};

const getNFTWithContractTokenIDWeb3 = async (
  config,
  nft,
  ownerAddress,
  contractAddress,
  tokenID,
  chain,
  key,
  walletID,
  networkName,
  networkMode,
  translate,
) => {
  try {
    nft = await axios.get(
      stringFormat(Config.NFT_WITH_TOKENID_URL, [
        `${contractAddress}`,
        `${tokenID}`,
        `${networkMode}`,
      ]),
      { headers: config },
    );
  } catch (e) {
    nft = null;
    ApiError(translate);
  }
  if (nft !== null) {
    const data = nft.data;
    try {
      const result = await axios.get(data.token_uri);
      const object = {
        contract: contractAddress,
        token_id: data.token_id,
        token_tracker: data.name ?? contractAddress,
        name: result.data.name ?? data.contract_type,
        symbol: data.symbol ?? '',
        description: result.data.description ?? '',
        image: result.data.image ?? null,
        animation_url: result.data.animation_url ?? '',
        owner: data.owner_of,
        network: networkName,
      };

      checkDuplicateNft(
        chain,
        object,
        walletID,
        contractAddress,
        data.token_id,
        translate,
        true,
      );
    } catch {
      const object = {
        contract: contractAddress,
        token_id: data.token_id,
        token_tracker: data.name ?? contractAddress,
        name: data.contract_type,
        symbol: data.symbol ?? '',
        description: '',
        image: null,
        animation_url: '',
        owner: data.owner_of,
        network: networkName,
      };

      checkDuplicateNft(
        chain,
        object,
        walletID,
        contractAddress,
        data.token_id,
        translate,
        true,
      );
    }
  }
};

//get all NFTs of owner and filter by contract Address
export const getAllNFTsFromOwner = async (
  ownerAddress,
  contractAddress,
  tokenID,
  chain,
  walletID,
  networkName,
  translate,
) => {
  const config = {
    'X-API-Key': headerConfigApiNFTs.API_Key,
    Accept: headerConfigApiNFTs.Accept,
  };
  const cursor =
    storage.getString(`${Constants.cursor}${walletID}${contractAddress}`) ?? '';
  let nft = [];

  switch (networkName) {
    case TOKEN_NAME.ethereum: {
      if (tokenID !== '') {
        await getNFTWithContractTokenIDWeb3(
          config,
          nft,
          ownerAddress,
          contractAddress,
          tokenID,
          chain,
          CONSTANTS.listNFTOfETHKey,
          walletID,
          networkName,
          Config.NFT_ETH,
          translate,
        );
      } else {
        await getNFTWithOnlyContractWeb3(
          config,
          cursor,
          nft,
          ownerAddress,
          contractAddress,
          tokenID,
          chain,
          CONSTANTS.listNFTOfETHKey,
          walletID,
          networkName,
          Config.NFT_ETH,
          translate,
        );
      }

      break;
    }
    case TOKEN_NAME.smartChain: {
      if (tokenID !== '') {
        await getNFTWithContractTokenIDWeb3(
          config,
          nft,
          ownerAddress,
          contractAddress,
          tokenID,
          chain,
          CONSTANTS.listNFTOfBSCKey,
          walletID,
          networkName,
          Config.NFT_BSC,
          translate,
        );
      } else {
        await getNFTWithOnlyContractWeb3(
          config,
          cursor,
          nft,
          ownerAddress,
          contractAddress,
          tokenID,
          chain,
          CONSTANTS.listNFTOfBSCKey,
          walletID,
          networkName,
          Config.NFT_BSC,
          translate,
        );
      }

      break;
    }
    case TOKEN_NAME.solana: {
      try {
        nft = await axios.get(
          stringFormat(Config.SOL_SERVER_URL, [
            Config.NFT_SOL,
            `${contractAddress}`,
          ]),
          { headers: config },
        );
      } catch (e) {
        nft = null;
        ApiError(translate);
      }
      if (nft !== null) {
        const cursorPage = nft.data.cursor ?? '';

        await storage.set(
          `${Constants.cursor}${walletID}${contractAddress}`,
          cursorPage,
        );
        await getNFTsSOL(
          nft,
          contractAddress,
          ownerAddress,
          walletID,
          chain,
          networkName,
          translate,
        );
      }
      break;
    }
  }
};

export const UnableToAddNFT = t => {
  storage.set(Constants.importNFTsError, true);
  return Alert.alert(
    t(STRINGS.unableToAddNFT),
    t(STRINGS.weCouldNotVerifyOwnerShip),
    [
      {
        text: t(STRINGS.ok_got_it),
        style: 'cancel',
      },
    ],
  );
};
const DuplicateNFTView = t => {
  storage.set(Constants.importNFTsError, true);
  return Alert.alert(
    t(STRINGS.duplicate_NFT_title),
    t(STRINGS.duplicate_NFT_massage),
    [
      {
        text: t(STRINGS.ok_got_it),
        style: 'cancel',
      },
    ],
  );
};
const ApiError = t => {
  storage.set(Constants.importNFTsError, true);
  return Alert.alert(t(STRINGS.api_error_title), t(STRINGS.api_error_message), [
    {
      text: t(STRINGS.ok_got_it),
      style: 'cancel',
    },
  ]);
};
