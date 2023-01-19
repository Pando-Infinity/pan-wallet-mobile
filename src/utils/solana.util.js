import {
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { rpc } from '../constants/walletConst';

const connection = new Connection(rpc.sol, 'confirmed');

export const toPubKey = address => {
  return new PublicKey(address);
};

const getTokenSupply = async tokenMintAddress => {
  return await connection.getTokenSupply(toPubKey(tokenMintAddress));
};

export const checkTokenAccountExistence = async (
  walletAddress,
  tokenMintAddress,
) => {
  try {
    const associatedTokenAccountInfo = await getAssociatedTokenAccountInfo(
      walletAddress,
      tokenMintAddress,
    );
    return Boolean(associatedTokenAccountInfo);
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) {
      return false;
    } else {
      throw error;
    }
  }
};

export const getAssociatedTokenAccountInfo = async (
  ownerAddress,
  tokenMintAddress,
) => {
  const associatedTokenAccount = await getAssociatedTokenAccount(
    ownerAddress,
    tokenMintAddress,
  );

  try {
    const associatedTokenAccountInfo = await getAccount(
      connection,
      associatedTokenAccount,
    );
    return associatedTokenAccountInfo;
  } catch (error) {
    window.isDebug && console.error(error);
    if (error instanceof TokenAccountNotFoundError) {
      return null;
    } else {
      throw error;
    }
  }
};

export const getAssociatedTokenAccount = (ownerAddress, tokenMintAddress) => {
  return getAssociatedTokenAddress(
    toPubKey(tokenMintAddress),
    toPubKey(ownerAddress),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
};

export const createTransferTokenIns = async (
  senderAddress,
  receiverAddress,
  tokenMintAddress,
  tokenAmount,
) => {
  const senderAssociatedTokenAccount = await getAssociatedTokenAccount(
    senderAddress,
    tokenMintAddress,
  );
  const receiverAssociatedTokenAccount = await getAssociatedTokenAccount(
    receiverAddress,
    tokenMintAddress,
  );

  const tokenSupplyInfo = await getTokenSupply(tokenMintAddress);
  const tokenBaseUnits = tokenSupplyInfo.value.decimals;

  const tokenAmountInSmallestUnit = tokenAmount * Math.pow(10, tokenBaseUnits);

  return createTransferInstruction(
    senderAssociatedTokenAccount,
    receiverAssociatedTokenAccount,
    toPubKey(senderAddress),
    parseInt(tokenAmountInSmallestUnit, 10),
    [],
    TOKEN_PROGRAM_ID,
  );
};

export const createAssociatedTokenAccountIns = async (
  payerAddress,
  ownerAddress,
  tokenMintAddress,
) => {
  const associatedTokenAccount = await getAssociatedTokenAccount(
    ownerAddress,
    tokenMintAddress,
  );

  return createAssociatedTokenAccountInstruction(
    toPubKey(payerAddress),
    associatedTokenAccount,
    toPubKey(ownerAddress),
    toPubKey(tokenMintAddress),
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
};
