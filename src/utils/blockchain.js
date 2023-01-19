import Web3 from 'web3';

export const getGasLimit = async provider => {
  const block = await provider.eth.getBlock('latest');
  return Math.floor(block.gasLimit / block.transactions.length);
};

export const convertWeiToNumber = (provider, value) => {
  return Number(
    // eslint-disable-next-line no-undef
    provider.utils.fromWei(BigInt(value).toString()).toString(),
    'ether',
  );
};

export const toHex = value => {
  return Web3.utils.toHex(value);
};
