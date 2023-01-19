import {TABLE_NAME} from '../constants';

export const BitcoinSCHEMA = {
  name: TABLE_NAME.bitcoin_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    address: 'string',
    privateKey: 'string',
  },
};
