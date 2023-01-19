import * as solanaWeb3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import nacl from 'tweetnacl';
import pkg from 'bs58';
import { rpc } from '../constants/walletConst';
import * as SolanaService from '../utils/solana.util';

const { decode } = pkg;

export const connection = new solanaWeb3.Connection(rpc.sol, 'confirmed');

export const getKeypairFromPrivateKey = privateKey => {
  const secretKey = decode(privateKey);
  return solanaWeb3.Keypair.fromSecretKey(secretKey);
};

export const getTokenAccount = async (userAddress, mintAddress) => {
  const userPublicKey = new solanaWeb3.PublicKey(userAddress);
  const mint = new solanaWeb3.PublicKey(mintAddress);
  return (
    await solanaWeb3.PublicKey.findProgramAddress(
      [
        userPublicKey.toBuffer(),
        splToken.TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    )
  )[0];
};

const delayInMs = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const sendTransactionWithRetry = async (
  instructions,
  signers,
  feePayerKeypair,
  commitment = 'confirmed',
  retrieves = 3,
) => {
  const blockhashResponse = await connection.getLatestBlockhashAndContext();
  const lastValidBlockHeight = blockhashResponse.context.slot + 150;

  const transaction = new solanaWeb3.Transaction({
    feePayer: feePayerKeypair.publicKey,
    recentBlockhash: blockhashResponse.value.blockhash,
  }).add(...instructions);

  transaction.sign(...signers);

  const message = transaction.serializeMessage();
  const signature = nacl.sign.detached(message, feePayerKeypair.secretKey);

  // eslint-disable-next-line no-undef
  transaction.addSignature(feePayerKeypair.publicKey, Buffer.from(signature));

  const rawTransaction = transaction.serialize();

  let blockHeight = await connection.getBlockHeight();
  let txId = '';

  while (blockHeight < lastValidBlockHeight) {
    txId = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    });
    try {
      await connection.confirmTransaction(txId, commitment);
      break;
    } catch (error) {
      await delayInMs(500);
      blockHeight = await connection.getBlockHeight();
      retrieves -= 1;
      if (retrieves === 0) {
        break;
      }
      throw error;
    }
  }
  return txId;
};

export const sendSolana = async (from, fromPrivateKey, to, amount) => {
  const walletPubKey = new solanaWeb3.PublicKey(from);
  const receiverPublicKey = new solanaWeb3.PublicKey(to);

  const instructions = [];
  instructions.push(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: walletPubKey,
      toPubkey: receiverPublicKey,
      lamports: amount,
    }),
  );
  const fromKeyPair = getKeypairFromPrivateKey(fromPrivateKey);
  const signers = [fromKeyPair];
  return await sendTransactionWithRetry(instructions, signers, fromKeyPair);
};

export const sendTokenSolana = async (
  from,
  fromPrivateKey,
  to,
  mint,
  amount,
) => {
  const walletPubKey = new solanaWeb3.PublicKey(from);
  const receiverPublicKey = new solanaWeb3.PublicKey(to);
  const tokenPublicKey = new solanaWeb3.PublicKey(mint);

  const receiverTokenAccountAddress = await getTokenAccount(
    receiverPublicKey,
    tokenPublicKey,
  );

  const receiverTokenAccountInfo = await connection.getAccountInfo(
    receiverTokenAccountAddress,
  );
  const instructions = [];
  if (receiverTokenAccountInfo == null) {
    instructions.push(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        tokenPublicKey,
        receiverTokenAccountAddress,
        receiverPublicKey,
        walletPubKey,
      ),
    );
  }
  const senderTokenAccountAddress =
    await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      tokenPublicKey,
      walletPubKey,
      false,
    );
  instructions.push(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      senderTokenAccountAddress,
      receiverTokenAccountAddress,
      walletPubKey,
      [],
      amount,
    ),
  );
  const fromKeyPair = getKeypairFromPrivateKey(fromPrivateKey);
  const signers = [fromKeyPair];
  return await sendTransactionWithRetry(
    connection,
    instructions,
    signers,
    fromKeyPair,
  );
};

export const sendNftSolana = async (from, to, nftId, fromPrivateKey) => {
  const instructions = [];

  const hasAssociatedNftAccountOfReceiver =
    await SolanaService.checkTokenAccountExistence(to, nftId);

  if (!hasAssociatedNftAccountOfReceiver) {
    const createAssociatedNftAccountForReceiverIns =
      await SolanaService.createAssociatedTokenAccountIns(from, to, nftId);

    instructions.push(createAssociatedNftAccountForReceiverIns);
  }

  const transferNFTIns = await SolanaService.createTransferTokenIns(
    from,
    to,
    nftId,
    1,
  );

  instructions.push(transferNFTIns);

  const transaction = new solanaWeb3.Transaction();
  instructions.forEach(instruction => transaction.add(instruction));

  const payer = getKeypairFromPrivateKey(fromPrivateKey);

  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    {
      skipPreflight: true,
      maxRetries: 3,
    },
  );

  // Handling Dropped Transactions
  const statusCheckInterval = 300;
  const timeout = 90000;

  let done = false;
  let isBlockHashValid = true;

  setTimeout(() => {
    if (done) {
      return;
    }
    done = true;
  }, timeout);

  while (!done && isBlockHashValid) {
    const confirmation = await connection.getSignatureStatus(signature);

    if (
      confirmation.value &&
      confirmation.value.confirmationStatus === 'finalized'
    ) {
      done = true;
      return signature;
    }

    const initialBlock = (await connection.getSignatureStatus(signature))
      .context.slot;

    isBlockHashValid = !(await isBlockHashExpired(initialBlock));
    await sleep(statusCheckInterval);
  }
};

export const isBlockHashExpired = async initialBlockHeight => {
  const currentBlockHeight = await connection.getBlockHeight();
  return currentBlockHeight > initialBlockHeight;
};

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
