import { TRANSACTION, SCREEN_NAME, TOKEN_TYPE, TABLE_NAME } from 'constants';
import { DAORepository } from 'databases/';
import { setTransaction } from 'stores/reducer/TransactionSlice';
import { formatDate } from 'utils/format.util';
import {
  checkChainToBindingData,
  getChainName,
  getWalletInfoActivatedByChainId,
} from 'utils/util';
import { waitBSCTx, waitEthTx, waitSOLTx } from 'walletCore/waitTxMined';
import * as NavigationRoot from 'components/navigation/rootNavigation';
import { Platform } from 'react-native';

export const DEVICES_OPTION = {
  mobile: '0',
  desktop: '1',
};

export const detectDevice = (qrcodeModal, qrcodeModalOptions) => {
  if (!qrcodeModal && !qrcodeModalOptions) {
    return DEVICES_OPTION.desktop;
  }
  return DEVICES_OPTION.mobile;
};

export const refactorConnectorData = async data => {
  const walletList = await DAORepository.getAllWallet();
  const SDKData = await DAORepository.getAllData(TABLE_NAME.session_connect);
  const newData = [];

  SDKData.forEach(
    ({
      _id,
      dapp_name,
      logo,
      url,
      address,
      networkName,
      connectedTime,
      walletID,
      bundle,
    }) => {
      const currentWalletInfo = walletList.find(
        ({ _id }) => _id === walletID,
      )?.name;
      let currentAddress =
        address?.btc ?? address?.eth ?? address?.bsc ?? address?.sol;
      if (Object.keys(address).length > 1 || !currentAddress) {
        currentAddress = '';
      }

      newData.push({
        id: _id,
        nameWallet: currentWalletInfo,
        imageDapp: logo,
        nameDapp: dapp_name,
        linkDapp: url,
        device: DEVICES_OPTION.mobile,
        connectedTime: formatDate(connectedTime),
        address: currentAddress,
        network: networkName,
        bundle,
      });
    },
  );

  data.forEach(({ session, walletName, walletId, connectedTime }) => {
    if (session.walletConnector) {
      const { peerMeta, peerId, chainId, qrcodeModal, qrcodeModalOptions } =
        session.walletConnector;
      newData.push({
        id: peerId,
        nameWallet: walletName,
        imageDapp: peerMeta?.icons[1] ?? peerMeta?.icons[0],
        nameDapp: peerMeta?.name,
        linkDapp: peerMeta?.url,
        device: detectDevice(qrcodeModal, qrcodeModalOptions),
        connectedTime: formatDate(connectedTime),
        address: session.walletConnector.accounts[0],
        network: getChainName(chainId),
      });
    }
  });
  return newData;
};

export const checkAvailabilityWallet = (list, chainId) => {
  if (Array.isArray(list)) {
    return list.find(item => item?.chainId === chainId);
  }
  return;
};

export const getInfoWallet = (id, chain) => {
  let jsonData = getWalletInfoActivatedByChainId(id, chain);
  if (!jsonData) {
    jsonData = checkChainToBindingData(id, chain);
  } else {
    jsonData = JSON.parse(jsonData);
    if (Array.isArray(jsonData) && jsonData.length === 0) {
      jsonData = checkChainToBindingData(id, chain);
    }
  }
  if (typeof jsonData === 'string') {
    return JSON.parse(jsonData);
  }
  return jsonData;
};

export const insertNewTransactionHistories = (dispatch, params) => {
  if (typeof params !== 'object') return;
  DAORepository.insertNewTransactionHistories(
    params.walletID,
    params.addressID,
    params.chainType,
    params.id,
    params.asset,
    params.gas,
    params.from,
    params.to,
    params.action,
    TRANSACTION.pending,
    params.tokenSymbol,
    params.coinSymbol,
    new Date(params.time),
  ).then(element => {
    const handleUpdateTransaction = (data, transactionType) => {
      DAORepository.updateStateTx(data._id, transactionType).then(item => {
        dispatch(
          setTransaction({
            data: item,
            onPress: () => handleNavigateToTransactionDetail(data),
          }),
        );
      });
    };

    const handleNavigateToTransactionDetail = (transactionData = {}) => {
      const time = transactionData?.time?.toLocaleTimeString();
      const date = transactionData?.time?.toLocaleDateString();

      NavigationRoot.navigate(SCREEN_NAME.transactionDetailScreen, {
        action: transactionData.actionTransaction,
        status: transactionData.statusTransaction,
        date: `${time} - ${date}`,
        from: transactionData.address_from,
        to: transactionData.address_to,
        amount: transactionData.amount,
        network: transactionData.networkBlockChain,
        transactionFee: transactionData.transactionFee,
        tokenUnit: transactionData.token,
        coinUnit: transactionData.coinByChain,
      });
    };

    if (Platform.OS === 'android') {
      let waitToMinedMethod;

      if (element.networkBlockChain === TOKEN_TYPE.ERC20) {
        waitToMinedMethod = waitEthTx;
      } else if (element.networkBlockChain === TOKEN_TYPE.SPL) {
        waitToMinedMethod = waitSOLTx;
      } else if (element.networkBlockChain === TOKEN_TYPE.BEP20) {
        waitToMinedMethod = waitBSCTx;
      }

      waitToMinedMethod(element.transactionHash)
        .then(() => {
          handleUpdateTransaction(element, TRANSACTION.confirm);
        })
        .catch(() => {
          handleUpdateTransaction(element, TRANSACTION.failed);
        });
    }
  });
};
