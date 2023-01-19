import {TABLE_NAME} from '../constants';

export const AccountWalletSCHEMA = {
  name: TABLE_NAME.account_wallet_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    name: 'string',
    seedPhrase: 'string',
    privateKey: 'string',
    chain: 'string',
    importType: 'string',
  },
};
