import { IMAGES } from '../constants';
import { TOKEN_NAME } from '../constants';

export const tokenListData = [
  {
    id: '1',
    icon: IMAGES.multi_chain,
    name: TOKEN_NAME.multiChain,
    privateKeyLength: 0,
  },
  {
    id: '2',
    icon: IMAGES.btc_icon,
    name: TOKEN_NAME.bitcoin,
    privateKeyLength: 52,
  },
  {
    id: '3',
    icon: IMAGES.eth_icon,
    name: TOKEN_NAME.ethereum,
    privateKeyLength: 64,
  },
  {
    id: '4',
    icon: IMAGES.bsc_icon,
    name: TOKEN_NAME.smartChain,
    privateKeyLength: 64,
  },
  {
    id: '5',
    icon: IMAGES.sol_icon,
    name: TOKEN_NAME.solana,
    privateKeyLength: [87, 88],
  },
];

export const netWorkListCustomToken = [
  {
    id: '0',
    image: IMAGES.eth_icon,
    name: TOKEN_NAME.ethereum,
  },
  {
    id: '1',
    image: IMAGES.bsc_icon,
    name: TOKEN_NAME.smartChain,
  },
  {
    id: '2',
    image: IMAGES.sol_icon,
    name: TOKEN_NAME.solana,
  },
];

export const tokenListMultiChainDefault = [
  {
    asset_id: 'BTC',
    name: 'Bitcoin',
    image: IMAGES.btc_icon,
    type: 'coin',
    isShow: true,
  },
  {
    asset_id: 'ETH',
    name: 'Ethereum',
    image: IMAGES.eth_icon,
    type: 'coin',
    isShow: true,
  },
  {
    asset_id: 'BSC',
    name: 'Smart Chain',
    image: IMAGES.bsc_icon,
    type: 'coin',
    isShow: true,
  },
  {
    asset_id: 'SOL',
    name: 'Solana',
    image: IMAGES.sol_icon,
    type: 'coin',
    isShow: true,
  },
];

export const tokenListBTCChainDefault = [
  {
    asset_id: 'BTC',
    name: 'Bitcoin',
    image: IMAGES.btc_icon,
    type: 'coin',
    isShow: true,
  },
];

export const tokenListETHChainDefault = [
  {
    asset_id: 'ETH',
    name: 'Ethereum',
    image: IMAGES.eth_icon,
    type: 'coin',
    isShow: true,
  },
];
export const tokenListBSCChainDefault = [
  {
    asset_id: 'BSC',
    name: 'Smart Chain',
    image: IMAGES.bsc_icon,
    type: 'coin',
    isShow: true,
  },
];
export const tokenListSOLChainDefault = [
  {
    asset_id: 'SOL',
    name: 'Solana',
    image: IMAGES.sol_icon,
    type: 'coin',
    isShow: true,
  },
];
