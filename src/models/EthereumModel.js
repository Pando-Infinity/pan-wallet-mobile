import {TABLE_NAME} from '../constants';

export const EthereumSCHEMA = {
  name: TABLE_NAME.ethereum_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    address: 'string',
    privateKey: 'string',
  },
};
