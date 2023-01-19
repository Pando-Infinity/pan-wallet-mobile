import Config from 'react-native-config';

export const rpc = {
  eth: Config.ETH_END_POINT,
  bsc: Config.BSC_END_POINT,
  sol: Config.SOL_END_POINT,
  btc: `https://api.blockcypher.com/v1/btc/${Config.BTC_MODE}/addrs/{0}/balance`,
  make_tx_btc: Config.BTC_MAKE_TX,
  btc_send_tx: Config.BTC_SEND_TX,
};

export const headerConfigApiNFTs = {
  API_Key: `${Config.API_KEY_NFTs}`,
  Accept: 'application/json',
};

export const SOLANA_DEFAULT_ID = {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID:
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
};

export const defaultGasLimit = 21000 * 1e9;
export const weiToGwei = 10 ** 9;
export const defaultEthGasPrice = 15;
export const ethGasLimit = 21000;
export const tokenGasLimit = 100000;
