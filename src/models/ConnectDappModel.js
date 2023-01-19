import { TABLE_NAME } from "../constants";

export const PanConnect = {
    name: TABLE_NAME.connect_dapp,
    primaryKey: '_id',
    properties: {
        _id: 'int',
        idConnects: 'int<>'
    }
}
