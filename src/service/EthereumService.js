import React, { useEffect } from 'react';
import { ethers } from 'ethers';

import { erc721abi, ownerOfABI, tokenURIABI, uriABI } from '../constants/abi';

export class EthereumService {
  static async getBalance(address: String, network: String) {
    const provider = new ethers.providers.JsonRpcProvider(network);
    const balanceToWei = await provider.getBalance(address);
    const balanceEth = ethers.utils.formatEther(balanceToWei);
    return Math.round(balanceEth * 10000) / 10000;
  }

  static async getMetadataWeb3(web3, contractAddress, tokenId) {
    const contract = new web3.eth.Contract(erc721abi, contractAddress);
    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const uri = await contract.methods.tokenURI(tokenId).call();
    return { name, symbol, uri };
  }

  static async getOwnerOfNFTWeb3(web3, contractAddress, tokenId) {
    const contract = new web3.eth.Contract(ownerOfABI, contractAddress);
    const result = await contract.methods.ownerOf(tokenId).call();
    return result;
  }
}
