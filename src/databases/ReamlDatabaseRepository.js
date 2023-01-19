import 'react-native-get-random-values';
import Realm from 'realm';
import { AccountWalletSCHEMA } from 'models/AccountWalletModel';
import { AddressSCHEMA } from 'models/AddressModel';
import { BitcoinSCHEMA } from 'models/BitcoinModel';
import { EthereumSCHEMA } from 'models/EthereumModel';
import { SolanaSCHEMA } from 'models/SolanaModel';
import { PanConnect } from 'models/ConnectDappModel';
import { SessionConnect } from 'models/SessionConnectModel';
import { TransactionSCHEMA } from 'models/TransactionHistoriesModel';
import { IMPORT_TYPE, TABLE_NAME, TOKEN_NAME } from '../constants';
import { KeychainRepository } from './index';
import { StackScreenSCHEMA } from 'models/StackModel';

const databaseOptions = {
  path: 'panWalletDatabase.realm',
  schema: [
    AccountWalletSCHEMA,
    AddressSCHEMA,
    BitcoinSCHEMA,
    EthereumSCHEMA,
    SolanaSCHEMA,
    TransactionSCHEMA,
    PanConnect,
    SessionConnect,
    StackScreenSCHEMA,
  ],
  schemaVersion: 11,
  encryptionKey: [],
};

//insert

const insertNewAccountWallet = (seedPhrase, privateKey, name, chain) =>
  new Promise((resolve, reject) => {
    const type = seedPhrase
      ? IMPORT_TYPE.seedPhraseType
      : IMPORT_TYPE.privateKeyType;

    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;
      Realm.open(databaseOptions)
        .then(realm => {
          const walletSchema = realm.objects(TABLE_NAME.account_wallet_schema);
          let id = 1;
          if (walletSchema.length > 0) {
            id = walletSchema[walletSchema.length - 1]._id + 1;
          }

          realm.write(() => {
            const newAccountWallet = {
              _id: id,
              name: name ? name : `Wallet${id}`,
              seedPhrase: seedPhrase,
              privateKey: privateKey,
              chain: chain,
              importType: type,
            };

            const wallet = realm.create(
              TABLE_NAME.account_wallet_schema,
              newAccountWallet,
            );

            resolve(wallet);
          });
        })
        .catch(error => reject(error));
    });
  });

const insertNewAddressSchema = (idAccountWallet, addressList) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const addressSchema = realm.objects(TABLE_NAME.address_schema);
          let id = 1;
          if (addressSchema.length > 0) {
            id = addressSchema[addressSchema.length - 1]._id + 1;
          }
          realm.write(() => {
            const newAddressSchema = {
              _id: id,
              idAccountWallet: idAccountWallet,
              addressList: addressList,
            };
            const address = realm.create(
              TABLE_NAME.address_schema,
              newAddressSchema,
            );
            resolve(address);
          });
        })
        .catch(error => reject(error));
    });
  });

const insertNewAccountBitcoin = account =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const bitcoinSchema = realm.objects(TABLE_NAME.bitcoin_schema);
          let id = 1;
          if (bitcoinSchema.length > 0) {
            id = bitcoinSchema[bitcoinSchema.length - 1]._id + 1;
          }
          realm.write(() => {
            const newAccountBitcoin = {
              _id: id,
              address: account.address,
              privateKey: account.privateKey,
            };
            const bitcoin = realm.create(
              TABLE_NAME.bitcoin_schema,
              newAccountBitcoin,
            );
            resolve(bitcoin);
          });
        })
        .catch(error => reject(error));
    });
  });

const insertNewAccountEthereum = account =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const ethereumSchema = realm.objects(TABLE_NAME.ethereum_schema);
          let id = 1;
          if (ethereumSchema.length > 0) {
            id = ethereumSchema[ethereumSchema.length - 1]._id + 1;
          }
          realm.write(() => {
            const newAccountEthereum = {
              _id: id,
              address: account.address,
              privateKey: account.privateKey,
            };
            const ethereum = realm.create(
              TABLE_NAME.ethereum_schema,
              newAccountEthereum,
            );
            resolve(ethereum);
          });
        })
        .catch(error => reject(error));
    });
  });

const insertNewAccountSolana = account =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const solanaSchema = realm.objects(TABLE_NAME.solana_schema);
          let id = 1;
          if (solanaSchema.length > 0) {
            id = solanaSchema[solanaSchema.length - 1]._id + 1;
          }
          realm.write(() => {
            const newAccountSolana = {
              _id: id,
              address: account.address,
              privateKey: account.privateKey,
            };
            const solana = realm.create(
              TABLE_NAME.solana_schema,
              newAccountSolana,
            );
            resolve(solana);
          });
        })
        .catch(error => reject(error));
    });
  });

const insertNewPanConnect = idWallet => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const pan = {
              _id: idWallet,
              idConnects: [],
            };
            resolve(realm.create(TABLE_NAME.connect_dapp, pan));
          });
        })
        .catch(error => reject(error));
    });
  });
};

const createSessionConnect = (
  token,
  schema,
  bundle,
  dapp_name,
  logo,
  url,
  address,
  walletID,
  networkName,
  connectedTime,
) => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            resolve(
              realm.create(TABLE_NAME.session_connect, {
                _id: token,
                schema: schema,
                bundle: bundle,
                dapp_name: dapp_name,
                logo: logo,
                url: url,
                address: address,
                walletID: walletID,
                networkName: networkName,
                connectedTime: connectedTime,
              }),
            );
          });
        })
        .catch(error => reject(error));
    });
  });
};

const insertNewTransactionHistories = (
  idWallet,
  idAddress,
  networkBlockChain,
  transactionHash,
  amount,
  transactionFee,
  address_from,
  address_to,
  actionTransaction,
  statusTransaction,
  token,
  coinByChain,
  time,
  idNft?,
  nameNft?,
) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const transactionSchema = realm.objects(
            TABLE_NAME.transaction_schema,
          );
          let id = 1;
          if (transactionSchema.length > 0) {
            id = transactionSchema[transactionSchema.length - 1]._id + 1;
          }
          realm.write(() => {
            const newTransaction = {
              _id: id,
              idWallet: idWallet,
              idAddress: idAddress,
              networkBlockChain: networkBlockChain,
              transactionHash: transactionHash,
              amount: amount,
              transactionFee: transactionFee,
              address_from: address_from,
              address_to: address_to,
              actionTransaction: actionTransaction,
              statusTransaction: statusTransaction,
              token: token,
              coinByChain: coinByChain,
              time: time,
              idNft: idNft,
              nameNft: nameNft,
            };
            const transaction = realm.create(
              TABLE_NAME.transaction_schema,
              newTransaction,
            );
            resolve(transaction);
          });
        })
        .catch(error => reject(error));
    });
  });

const saveStackScreen = stackScreen => {
  KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;

    Realm.open(databaseOptions).then(realm => {
      const stacks = realm.objectForPrimaryKey(
        TABLE_NAME.stack_screen_schema,
        1,
      );

      realm.write(() => {
        if (stacks != null) {
          stacks.stack = JSON.stringify(stackScreen);
        } else {
          const stack = { _id: 1, stack: JSON.stringify(stackScreen) };
          realm.create(TABLE_NAME.stack_screen_schema, stack);
        }
      });
    });
  });
};

const updateStateTx = (id, state) => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;
      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const tx = realm.objectForPrimaryKey(
              TABLE_NAME.transaction_schema,
              id,
            );
            tx.statusTransaction = state;
            resolve(tx);
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  });
};

//update

const updateIdTokenOfAddressSchemaLastRecord = idToken =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const addressSchema = realm.objects(TABLE_NAME.address_schema);
            const addressLastItem = addressSchema[addressSchema.length - 1];
            const record = addressLastItem.addressList.push(idToken);
            resolve(record);
          });
        })
        .catch(error => reject(error));
    });
  });

const updateIdTokenOfAddressSchemaByIdAddressList = (idToken, idAddressList) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const addressSchema = realm.objectForPrimaryKey(
              TABLE_NAME.address_schema,
              idAddressList,
            );
            const record = addressSchema.addressList.push(idToken);
            resolve(record);
          });
        })
        .catch(error => reject(error));
    });
  });

const updateWalletName = (name, id) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const listWallet = realm.objectForPrimaryKey(
              TABLE_NAME.account_wallet_schema,
              id,
            );
            listWallet.name = name;
            resolve(listWallet.name);
          });
        })
        .catch(error => reject(error));
    });
  });

const addSessionConnectByIdWallet = (idWallet, idSession) => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const schema = realm.objectForPrimaryKey(
              TABLE_NAME.connect_dapp,
              idWallet,
            );
            const record = schema.idConnects.add(idSession);
            resolve(record);
          });
        })
        .catch(error => reject(error));
    });
  });
};

//query

const getAllData = table_name => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const list = realm.objects(table_name);
          resolve(list);
        })
        .catch(error => reject(error));
    });
  });
};

const getAllWallet = () =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const listWallet = realm.objects(TABLE_NAME.account_wallet_schema);
          resolve(listWallet);
        })
        .catch(error => reject(error));
    });
  });

const getWalletByID = id =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const wallet = realm.objectForPrimaryKey(
            TABLE_NAME.account_wallet_schema,
            id,
          );
          resolve(wallet);
        })
        .catch(error => reject(error));
    });
  });

const getListAddressTokenByWalletId = walletId =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const addressSchema = realm.objects(TABLE_NAME.address_schema);
          const listAddressById = addressSchema.filtered(
            `idAccountWallet == ${walletId}`,
          )[0].addressList;
          resolve(listAddressById);
        })
        .catch(error => reject(error));
    });
  });

const getBitcoinById = bitcoinId =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const bitcoin = realm.objectForPrimaryKey(
            TABLE_NAME.bitcoin_schema,
            bitcoinId,
          );
          resolve(bitcoin);
        })
        .catch(error => reject(error));
    });
  });

const getAllBitcoin = () =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const bitcoin = realm.objects(TABLE_NAME.bitcoin_schema);
          resolve(bitcoin);
        })
        .catch(error => reject(error));
    });
  });

const getEthereumById = ethereumId =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const ethereum = realm.objectForPrimaryKey(
            TABLE_NAME.ethereum_schema,
            ethereumId,
          );
          resolve(ethereum);
        })
        .catch(error => reject(error));
    });
  });

const getAllEthereum = () =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const ethereum = realm.objects(TABLE_NAME.ethereum_schema);
          resolve(ethereum);
        })
        .catch(error => reject(error));
    });
  });

const getSolanaById = solanaId =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const solana = realm.objectForPrimaryKey(
            TABLE_NAME.solana_schema,
            solanaId,
          );
          resolve(solana);
        })
        .catch(error => reject(error));
    });
  });

const getAllSolana = () =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const solana = realm.objects(TABLE_NAME.solana_schema);
          resolve(solana);
        })
        .catch(error => reject(error));
    });
  });

const getTransactionHistoriesByAddress = (idAddress, token) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const transactions = realm
            .objects(TABLE_NAME.transaction_schema)
            .filtered(`idAddress == "${idAddress}" && token == "${token}"`)
            .sorted('time', true);
          resolve(transactions);
        })
        .catch(error => reject(error));
    });
  });

const getTransactionHistoryByWallet = idWallet =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const transactions = realm
            .objects(TABLE_NAME.transaction_schema)
            .filtered(`idWallet == "${idWallet}"`)
            .sorted('time', true);
          resolve(transactions);
        })
        .catch(error => reject(error));
    });
  });

const getTransactionHistoryFilterDate = (idWallet, dateFrom, dateTo) =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const transactions = realm
            .objects(TABLE_NAME.transaction_schema)
            .filtered(
              'idWallet == $0 && time >=$1 && time<=$2',
              idWallet,
              dateFrom,
              dateTo,
            );
          resolve(transactions);
        })
        .catch(error => reject(error));
    });
  });

const getStackScreen = () =>
  new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          const stacks = realm.objectForPrimaryKey(
            TABLE_NAME.stack_screen_schema,
            1,
          );
          resolve(JSON.parse(stacks.stack));
        })
        .catch(error => reject(error));
    });
  });

//delete

const deleteSessionConnectByIdWallet = (idWallet, idSession) => {
  return new Promise((resolve, reject) => {
    KeychainRepository.getEncryptionKey().then(key => {
      databaseOptions.encryptionKey = key;

      Realm.open(databaseOptions)
        .then(realm => {
          realm.write(() => {
            const schema = realm.objectForPrimaryKey(
              TABLE_NAME.connect_dapp,
              idWallet,
            );
            const record = schema.idConnects.remove(idSession);
            resolve(record);
          });
        })
        .catch(error => reject(error));
    });
  });
};

const deleteAllObject = () => {
  KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;
    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        realm.deleteAll();
      });
      realm.close();
    });
  });
};

const deleteSessionByDappBundleAndNetworkName = async (bundle, networkName) => {
  const realm = await Realm.open(databaseOptions);
  databaseOptions.encryptionKey = await KeychainRepository.getEncryptionKey();
  realm.write(() => {
    realm.delete(
      realm
        .objects(TABLE_NAME.session_connect)
        .filtered('bundle == $0 && networkName ==$1', bundle, networkName),
    );
  });
};

const deleteSessionByWalletId = walletID => {
  KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;

    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        realm.delete(
          realm
            .objects(TABLE_NAME.session_connect)
            .filter(obj => obj.walletID === walletID),
        );
      });
    });
  });
};

const deleteCoinAddressByAddressID = (addressID, tbn) => {
  KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;

    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        realm.delete(realm.objectForPrimaryKey(tbn, addressID));
      });
    });
  });
};

const tokenNameToSchema = token => {
  return token === TOKEN_NAME.bitcoin
    ? TABLE_NAME.bitcoin_schema
    : token === TOKEN_NAME.ethereum
    ? TABLE_NAME.ethereum_schema
    : token === TOKEN_NAME.solana
    ? TABLE_NAME.solana_schema
    : '';
};

const deleteAddressByWalletID = async walletID => {
  const data = await getAllData(TABLE_NAME.address_schema);
  data
    .filter(item => item.idAccountWallet === walletID)
    .forEach(element => {
      element.addressList.forEach(item => {
        const [chain, id] = item.split('-');
        deleteCoinAddressByAddressID(
          parseInt(id, 10),
          tokenNameToSchema(chain),
        );
      });
    });

  KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;

    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        realm.delete(
          realm
            .objects(TABLE_NAME.address_schema)
            .filter(item => item.idAccountWallet === walletID),
        );
      });
    });
  });
};

const deleteWalletByID = async walletID => {
  await deleteAddressByWalletID(walletID).done();
  await deleteSessionByWalletId(walletID);
  await KeychainRepository.getEncryptionKey().then(key => {
    databaseOptions.encryptionKey = key;

    Realm.open(databaseOptions).then(realm => {
      realm.write(() => {
        realm.delete(
          realm.objectForPrimaryKey(TABLE_NAME.account_wallet_schema, walletID),
        );
      });
    });
  });
};

export default {
  insertNewAccountWallet,
  insertNewAddressSchema,
  insertNewAccountBitcoin,
  insertNewAccountEthereum,
  insertNewAccountSolana,
  insertNewTransactionHistories,
  saveStackScreen,
  createSessionConnect,
  updateIdTokenOfAddressSchemaLastRecord,
  updateIdTokenOfAddressSchemaByIdAddressList,
  updateStateTx,
  updateWalletName,
  getAllWallet,
  getListAddressTokenByWalletId,
  getBitcoinById,
  getAllBitcoin,
  getEthereumById,
  getAllEthereum,
  getSolanaById,
  getAllSolana,
  getTransactionHistoriesByAddress,
  getTransactionHistoryByWallet,
  getTransactionHistoryFilterDate,
  getAllData,
  getWalletByID,
  getStackScreen,
  deleteAllObject,
  deleteSessionByDappBundleAndNetworkName,
  deleteWalletByID,
};
