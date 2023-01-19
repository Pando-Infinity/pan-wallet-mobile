import { IMAGES } from '../constants';

export const chain = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'Coin',
    logo: IMAGES.btc_icon,
    chainType: 'BTC',
    decimals: 8,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'Coin',
    logo: IMAGES.eth_icon,
    chainType: 'ERC20',
    decimals: 18,
  },
  {
    symbol: 'BNB',
    name: 'Smart Chain',
    type: 'Coin',
    logo: IMAGES.bsc_icon,
    chainType: 'BEP20',
    decimals: 18,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    type: 'Coin',
    logo: IMAGES.sol_icon,
    chainType: 'SPL',
    decimals: 9,
  },
];
