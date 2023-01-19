import React from 'react';

export default class BTCService {
  static async getBalance(address: String, network: String) {
    const res = await fetch(
      'https://api.blockcypher.com/v1/btc/' +
        network +
        '/addrs/' +
        address +
        '/balance',
    );
    const result = await res.json();
    return result.balance / 100000000;
  }
}
