import Config from 'react-native-config';
import { approveABI } from '../constants/abi';
import { ethers } from 'ethers';
import Web3 from 'web3';

const web3 = new Web3();

const MAX_INT_256 =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // (BigInt(2 ** 256) - BigInt(1)).toString()

const apiFunction =
  'function approve(address _spender, uint256 _value) public returns (bool success)';

const provider = new ethers.providers.JsonRpcProvider(Config.ETH_END_POINT);

export const approveSendBuyToken = async (
  spender,
  tokenAddress,
  amount,
  type,
) => {
  switch (type) {
    case 'ERC20': {
      const contract = new ethers.Contract(tokenAddress, apiFunction, provider);
      await contract.approve(spender, amount);
    }
  }
};

export const getApproveTokenEstimateGas = async (
  web3Provider,
  contractAddress,
  from,
  amountInNumber,
) => {
  const contractConnect = new web3Provider.eth.Contract(
    approveABI,
    contractAddress,
    { from },
  );

  const amount = convertNumberToWei(amountInNumber);

  let convertedAmountToBigNumber = amount;
  try {
    // eslint-disable-next-line no-undef
    convertedAmountToBigNumber = BigInt(amount);
  } catch (error) {
    convertedAmountToBigNumber = amount;
  }
  const convertedAmount = convertNumberToWei(convertedAmountToBigNumber);

  return await contractConnect.methods
    .approve(contractAddress, MAX_INT_256)
    .estimateGas({ from })
    .catch(() => {
      return contractConnect.methods
        .approve(contractAddress, convertedAmount)
        .estimateGas({ from });
    });
};

export const convertNumberToWei = value => {
  return web3.utils.toWei(value.toString(), 'ether');
};
