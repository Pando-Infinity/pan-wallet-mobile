import axios from 'axios';
import Web3 from 'web3';
import stringFormat from 'components/StringFormat/StringFormat';
import { TOKEN_SYMBOL } from 'constants';
import * as solanaWeb3 from '@solana/web3.js';
import { rpc, SOLANA_DEFAULT_ID } from 'constants/walletConst';
/* eslint-disable no-case-declarations */

export const getCoinBalance = async (address, coin) => {
  try {
    switch (coin) {
      case TOKEN_SYMBOL.btc:
      case 'BTC':
        return await (
          await axios.get(stringFormat(rpc.btc, [address]))
        ).data.balance;
      case TOKEN_SYMBOL.eth:
      case 'ERC20':
        const web3 = new Web3(rpc.eth);
        return await web3.eth.getBalance(address);
      case TOKEN_SYMBOL.bsc:
      case TOKEN_SYMBOL.bnb:
      case 'BEP20':
        const web3bsc = new Web3(rpc.bsc);
        return await web3bsc.eth.getBalance(address);
      case TOKEN_SYMBOL.sol:
      case 'SPL':
        const pub = new solanaWeb3.PublicKey(address);
        const solana = new solanaWeb3.Connection(rpc.sol, 'finalized');
        return await solana.getBalance(pub);
      default:
        return 0;
    }
  } catch {
    return 0;
  }
};

const getERC20TokenBalance = async (address, smartContract) => {
  const client = new Web3(rpc.eth);
  const contract = new client.eth.Contract(ethABI, smartContract);
  const gweiBalance = await contract.methods.balanceOf(address).call();
  return gweiBalance;
};

const getBEP20TokenBalance = async (address, smartContract) => {
  try {
    const client = new Web3(rpc.bsc);
    const contract = new client.eth.Contract(bscABI, smartContract);
    const gweiBalance = await contract.methods.balanceOf(address).call();
    return gweiBalance;
  } catch (error) {
    return 0;
  }
};

const getSPLTokenBalance = async (address, mintAddress) => {
  const acc = await getTokenAccount(address, mintAddress);
  const connect = new solanaWeb3.Connection(rpc.sol, 'finalized');
  const userAccountInfo = await connect.getParsedAccountInfo(acc);
  return parseFloat(
    userAccountInfo.value.data.parsed.info.tokenAmount.amount / 1e9,
  ).toFixed(2);
};
const getTokenAccount = async (address, mint) => {
  const pub = new solanaWeb3.PublicKey(address);
  const minPub = new solanaWeb3.PublicKey(mint);
  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new solanaWeb3.PublicKey(
    SOLANA_DEFAULT_ID.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
  const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey(
    SOLANA_DEFAULT_ID.TOKEN_PROGRAM_ID,
  );
  return (
    await solanaWeb3.PublicKey.findProgramAddress(
      [pub.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), minPub.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    )
  )[0];
};

export const getTokenBalance = async (address, smartContract, type) => {
  try {
    switch (type) {
      case 'ERC20':
        return await getERC20TokenBalance(address, smartContract);
      case 'BEP20':
        return await getBEP20TokenBalance(address, smartContract);
      case 'SPL':
        return await getSPLTokenBalance(address, smartContract);
      default:
        return 0;
    }
  } catch {
    return 0;
  }
};

const ethABI = [
  {
    constant: true,

    inputs: [{ name: '_owner', type: 'address' }],

    name: 'balanceOf',

    outputs: [{ name: 'balance', type: 'uint256' }],

    type: 'function',
  },
];

const bscABI = [
  {
    constant: true,
    inputs: [{ name: 'who', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

export default {
  getCoinBalance,
  getTokenBalance,
};
