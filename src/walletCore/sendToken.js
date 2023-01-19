import Web3 from 'web3';
import { ethGasLimit, rpc, tokenGasLimit } from '../constants/walletConst';
import axios from 'axios';
import bitcore from 'bitcore-lib';
import { sendSolana, sendTokenSolana } from './solana';

const bscConnect = new Web3(rpc.bsc);
const ethConnect = new Web3(rpc.eth);

const sendTokenBSC = (wallet, to, contract, value, gasLimit, gasPrice) => {
  return new Promise((resolve, reject) => {
    const contractConnect = new bscConnect.eth.Contract(sendABI, contract, {
      from: wallet.address,
    });
    const amount = Web3.utils.toHex(value);
    const data = contractConnect.methods.transfer(to, amount).encodeABI();
    const txObj = {
      gasLimit: Web3.utils.toHex(gasLimit),
      gasPrice: Web3.utils.toHex(gasPrice),
      to: contract,
      value: '0x00',
      data: data,
      from: wallet.address,
    };

    bscConnect.eth.accounts.signTransaction(
      txObj,
      wallet.privateKey,
      (err, signedTx) => {
        if (err) {
          reject(err);
        } else {
          bscConnect.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            },
          );
        }
      },
    );
  });
};

const sendTokenERC20 = (wallet, to, contract, value, gas) => {
  return new Promise((resolve, reject) => {
    const contractConnect = new ethConnect.eth.Contract(
      sendABI,
      contract,
      wallet.address,
      { from: wallet.address },
    );
    const amount = Web3.utils.toHex(value);
    const data = contractConnect.methods.transfer(to, amount).encodeABI();
    const txObj = {
      gasLimit: Web3.utils.toHex(tokenGasLimit),
      gasPrice: Web3.utils.toHex(gas / tokenGasLimit),
      to: contract,
      value: '0x00',
      data: data,
      from: wallet.address,
    };

    ethConnect.eth.accounts.signTransaction(
      txObj,
      wallet.privateKey,
      (err, signedTx) => {
        if (err) {
          reject(err);
        } else {
          ethConnect.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            },
          );
        }
      },
    );
  });
};

const sendBSC = (wallet, to, value, gasLimit, maxPriorityFeePerGas) => {
  return new Promise((resolve, reject) => {
    const addressFrom = wallet.address;
    const addressTo = to;
    bscConnect.eth
      .getTransactionCount(addressFrom)
      .then(txCount => {
        const txObject = {
          nonce: Web3.utils.toHex(txCount),
          to: addressTo,
          value: Web3.utils.toHex(value),
          gasLimit: Web3.utils.toHex(gasLimit),
          gasPrice: Web3.utils.toHex(maxPriorityFeePerGas),
        };

        bscConnect.eth.accounts
          .signTransaction(txObject, wallet.privateKey)
          .then(signedTx => {
            bscConnect.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .then(res => {
                resolve(res);
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

const sendETH = (
  wallet,
  to,
  value,
  gas,
  gasPrice,
  maxPriorityFeePerGas,
  maxFeePerGas,
) => {
  return new Promise((resolve, reject) => {
    const addressFrom = wallet.address;
    const addressTo = to;
    ethConnect.eth.getTransactionCount(addressFrom, (err, txCount) => {
      if (err) {
        reject(err);
      } else {
        const txObject = {
          nonce: Web3.utils.toHex(txCount), // optional
          to: addressTo,
          value: Web3.utils.toHex(value),
          gasLimit: Web3.utils.toHex(ethGasLimit),
          maxPriorityFeePerGas: Web3.utils.toHex(maxPriorityFeePerGas),
          maxFeePerGas: Web3.utils.toHex(maxFeePerGas),
        };
        ethConnect.eth.accounts.signTransaction(
          txObject,
          wallet.privateKey,
          (err, signedTx) => {
            if (err) {
              reject(err);
            } else {
              ethConnect.eth.sendSignedTransaction(
                signedTx.rawTransaction,
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(res);
                  }
                },
              );
            }
          },
        );
      }
    });
  });
};

const sendBitcoinMethod = async (wallet, to, value, gas) => {
  const response = await axios.get(rpc.make_tx_btc + wallet.address);
  const transaction = new bitcore.Transaction();
  const inputs = [];
  const utxos = response.data.data.txs;
  for (const element of utxos) {
    const utxo = {};
    utxo.satoshis = Math.floor(Number(element.value) * 100000000); // btc to satoshis
    utxo.script = element.script_hex;
    utxo.address = response.data.data.address;
    utxo.txId = element.txid;
    utxo.outputIndex = element.output_no;
    inputs.push(utxo);
  }
  transaction.from(inputs);
  transaction.to(to, value);
  transaction.change(wallet.address);
  transaction.fee(gas);
  transaction.sign(wallet.privateKey);

  const serializedTransaction = transaction.serialize();

  const sendSignTx = await axios({
    method: 'POST',
    url: rpc.btc_send_tx,
    data: {
      tx_hex: serializedTransaction,
    },
  });
  return sendSignTx.data.data;
};

const sendBitcoin = (wallet, to, value, gas) => {
  return new Promise((resolve, reject) => {
    sendBitcoinMethod(wallet, to, value, gas)
      .then(tx => {
        resolve(tx);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const sendSol = (address, privateKey, to, amount) => {
  return new Promise((resolve, reject) => {
    sendSolana(address, privateKey, to, amount)
      .then(txid => {
        resolve(txid);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const sendTokenSol = (address, privateKey, to, id, amount) => {
  return new Promise((resolve, reject) => {
    sendTokenSolana(address, privateKey, to, id, amount)
      .then(txid => resolve(txid))
      .catch(error => reject(error));
  });
};

const sendABI = [
  // transfer
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    type: 'function',
  },
];

export const walletSend = (
  wallet,
  to,
  amount,
  gas,
  token,
  gasPrice,
  maxPriorityFeePerGas,
  maxFeePerGas,
) => {
  if (token.type === 'Coin') {
    switch (token.chainType) {
      case 'ERC20':
        return sendETH(
          wallet,
          to,
          amount,
          gas,
          gasPrice,
          maxPriorityFeePerGas,
          maxFeePerGas,
        );
      case 'BEP20':
        return sendBSC(wallet, to, amount, ethGasLimit, maxPriorityFeePerGas);
      case 'SPL':
        return sendSol(wallet.address, wallet.privateKey, to, amount);
      case 'BTC':
        return sendBitcoin(wallet, to, amount, gas);
    }
  } else {
    switch (token.type) {
      case 'ERC20':
        return sendTokenERC20(wallet, to, token.contract, amount, gas);
      case 'BEP20':
        return sendTokenBSC(
          wallet,
          to,
          token.contract,
          amount,
          tokenGasLimit,
          gasPrice,
        );
      case 'SPL':
        return sendTokenSol(
          wallet.address,
          wallet.privateKey,
          to,
          token.id,
          amount,
        );
      case 'BTC':
        return Promise.resolve((resolve, reject) => {
          reject('bitcoin dont have token!!!');
        });
    }
  }
};
