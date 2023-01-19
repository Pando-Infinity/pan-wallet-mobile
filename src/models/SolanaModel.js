import {TABLE_NAME} from '../constants';

export const SolanaSCHEMA = {
  name: TABLE_NAME.solana_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    address: 'string',
    privateKey: 'string',
  },
};
