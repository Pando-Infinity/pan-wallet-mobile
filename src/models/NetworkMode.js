export const NetworkMode = {
  binanceSmartChain: {
    test_net: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    main_net: 'https://bsc-dataseed1.binance.org:443',
  },
  ethereum: {
    main_net: 'https://mainnet.infura.io/v3/2d802201044e4d8bb24c5165bad68878',
    ropsten: 'https://ropsten.infura.io/v3/2d802201044e4d8bb24c5165bad68878',
    kovan: 'https://kovan.infura.io/v3/2d802201044e4d8bb24c5165bad68878',
    rinkeby: 'https://rinkeby.infura.io/v3/2d802201044e4d8bb24c5165bad68878',
    goerli: 'https://goerli.infura.io/v3/2d802201044e4d8bb24c5165bad68878',
  },
  bitcoin: {
    main_net: 'main',
    test_net: 'test3',
  },
  solana: {
    main_net_serum: 'https://solana-api.projectserum.com',
    main_net_beta: 'https://api.mainnet-beta.solana.com',
    test_net: 'https://api.testnet.solana.com',
    dev_net: 'https://api.devnet.solana.com',
  },
};
