import { TABLE_NAME } from '../constants';

export const TransactionSCHEMA = {
  name: TABLE_NAME.transaction_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    idWallet: 'int',
    idAddress: 'int',
    networkBlockChain: 'string',
    transactionHash: 'string?',
    token: 'string?', //token symbol
    coinByChain: 'string?', // coin symbol
    amount: 'float?',
    transactionFee: 'float?',
    address_from: 'string',
    address_to: 'string',
    actionTransaction: 'string',
    statusTransaction: 'string',
    time: 'date',
    idNft: 'string?',
    nameNft: 'string?',
  },
};
