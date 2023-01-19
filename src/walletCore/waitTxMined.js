import Web3 from 'web3';
import { rpc } from 'constants/walletConst';
import * as solanaWeb3 from '@solana/web3.js';
import Transaction from 'constants/Transaction';
const ethConnect = new Web3(rpc.eth);
const bscConnect = new Web3(rpc.bsc);
const solConnect = new solanaWeb3.Connection(rpc.sol, 'confirmed');
const expectedBlockTime = 1000;

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const waitEthTx = async hash => {
  try {
    let transactionReceipt = null;
    while (transactionReceipt == null) {
      transactionReceipt = await ethConnect.eth.getTransactionReceipt(hash);
      await sleep(expectedBlockTime);
    }

    return transactionReceipt.status === true
      ? Transaction.confirm
      : Transaction.failed;
  } catch (error) {
    throw new Error(error.toString());
  }
};

export const waitBSCTx = async hash => {
  try {
    let transactionReceipt = null;
    while (transactionReceipt == null) {
      transactionReceipt = await bscConnect.eth.getTransactionReceipt(hash);
      await sleep(expectedBlockTime);
    }

    return transactionReceipt.status === true
      ? Transaction.confirm
      : Transaction.failed;
  } catch (error) {
    throw new Error(error.toString());
  }
};

export const waitSOLTx = hash => {
  return new Promise((resolve, reject) => {
    solConnect
      .confirmTransaction(hash, 'confirm')
      .then(() => {
        resolve('ok');
      })
      .catch(error => {
        reject(error);
      });
  });
};
