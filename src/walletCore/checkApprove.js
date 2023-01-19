import { TOKEN_SYMBOL } from 'constants';
import { rpc } from '../constants/walletConst';
import { erc20ABI, smartBandAbi } from '../constants/abi';
import { convertNumberToWei } from 'walletCore/approveToken';

const Web3 = require('web3');
export const isApproveTokenOfDeposit = async (
  addressOwner,
  addressSpender,
  contractAddress,
  chain,
  amount,
) => {
  let provider;
  const amountWeiTypeString = convertNumberToWei(amount);
  const amountWeiTypeBigNumber = parseInt(amountWeiTypeString, 10);

  switch (chain) {
    case TOKEN_SYMBOL.bsc: {
      provider = new Web3(rpc.bsc);
      break;
    }

    case TOKEN_SYMBOL.eth: {
      provider = new Web3(rpc.eth);
      break;
    }
  }

  const contract = new provider.eth.Contract(erc20ABI, contractAddress);

  const amountApproveTypeString = await contract.methods
    .allowance(addressOwner, addressSpender)
    .call();

  const amountApproveTypeBigNumber = parseInt(amountApproveTypeString, 10);

  return amountApproveTypeBigNumber >= amountWeiTypeBigNumber;
};

export const isApproveForAll = async (
  addressOwner,
  addressOperator,
  contractAddress,
  chain,
) => {
  let provider;
  switch (chain) {
    case TOKEN_SYMBOL.bsc: {
      provider = new Web3(rpc.bsc);
      break;
    }

    case TOKEN_SYMBOL.eth: {
      provider = new Web3(rpc.eth);
      break;
    }
  }

  const contract = new provider.eth.Contract(smartBandAbi, contractAddress);

  return await contract.methods
    .isApprovedForAll(addressOwner, addressOperator)
    .call();
};
