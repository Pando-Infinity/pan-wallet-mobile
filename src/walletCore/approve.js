import { setApprovalForAllABI } from '../constants/abi';

export const getEstimateGas = (provider, contractAddress, from) => {
  const contractConnect = new provider.eth.Contract(
    setApprovalForAllABI,
    contractAddress,
    { from },
  );

  return contractConnect.methods
    .setApprovalForAll(contractAddress, true)
    .estimateGas({ from });
};
