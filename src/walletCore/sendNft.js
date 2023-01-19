import Web3 from 'web3';
import { rpc } from 'constants/walletConst';
import { bscGasLimit } from '../constants/walletConst';

const bscConnect = new Web3(rpc.bsc);
const ethConnect = new Web3(rpc.eth);

const getDataEncodeABI = (
  provider,
  contractAddress,
  walletAddress,
  to,
  tokenId,
) => {
  const contractConnect = new provider.eth.Contract(
    sendNftABI,
    contractAddress,
    { from: walletAddress },
  );
  const tokenIdHex = Web3.utils.toHex(tokenId);

  const data = contractConnect.methods
    .transferFrom(walletAddress, to, tokenIdHex)
    .encodeABI();

  return data;
};

const sendNft = async (
  provider,
  contractAddress,
  walletAddress,
  walletPrivateKey,
  to,
  tokenId,
  gasFee,
) => {
  let gasLimit = bscGasLimit;

  const block = await provider.eth.getBlock('latest');
  gasLimit = Math.floor(block.gasLimit / block.transactions.length);

  return new Promise((resolve, reject) => {
    const data = getDataEncodeABI(
      provider,
      contractAddress,
      walletAddress,
      to,
      tokenId,
    );

    const transactionObj = {
      gasLimit: Web3.utils.toHex(gasLimit),
      to: contractAddress,
      value: '0x00',
      data,
      from: walletAddress,
    };

    provider.eth.accounts.signTransaction(
      transactionObj,
      walletPrivateKey,
      (err, signedTx) => {
        if (err) {
          reject(err);
        } else {
          provider.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            (error, txHash) => {
              if (error) {
                reject(error);
              } else {
                const interval = setInterval(function () {
                  provider.eth.getTransactionReceipt(
                    txHash,
                    (_err, receipt) => {
                      if (receipt) {
                        receipt.logs.length ? resolve(txHash) : reject('');
                        clearInterval(interval);
                      }
                    },
                  );
                }, 1000);
              }
            },
          );
        }
      },
    );
  });
};

export const sendNftBSC = (
  contractAddress,
  walletAddress,
  walletPrivateKey,
  to,
  tokenId,
  gasFee,
) => {
  return sendNft(
    bscConnect,
    contractAddress,
    walletAddress,
    walletPrivateKey,
    to,
    tokenId,
    gasFee,
  );
};

export const sendNftETH = (
  contractAddress,
  walletAddress,
  walletPrivateKey,
  to,
  tokenId,
  gasFee,
) => {
  return sendNft(
    ethConnect,
    contractAddress,
    walletAddress,
    walletPrivateKey,
    to,
    tokenId,
    gasFee,
  );
};

const sendNftABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
