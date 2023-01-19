import React from 'react';
import {ethers} from 'ethers';

export default class BCSService {
  static async getBalance(address: String, network: String) {
    const provider = new ethers.providers.JsonRpcProvider(network);
    const balanceToWei = await provider.getBalance(address);
    const balanceBNB = ethers.utils.formatEther(balanceToWei);
    return Math.round(balanceBNB * 10000) / 10000;
  }
}
