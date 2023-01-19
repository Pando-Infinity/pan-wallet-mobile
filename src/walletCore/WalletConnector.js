import RNWalletConnect from '@walletconnect/client';
import { parseWalletConnectUri } from '@walletconnect/utils';
import { CONSTANTS, SCREEN_NAME } from '../constants';
import storage from 'databases/AsyncStorage';
import { store } from 'stores/store.js';
import { updateLoading } from 'stores/reducer/walletConnect';
import { getPrivateKey, getProvider, getWalletId } from 'utils/util';

const { dispatch } = store;

let connectors = [];
const tempCallIds = [];
let navigation;
const NATIVE_OPTION = {
  clientMeta: {
    url: '',
    icons: [],
    name: 'PanWallet',
    ssl: true,
  },
};
const WALLETCONNECT_SESSIONS = 'walletConnect';

const persistSessions = async () => {
  const sessions = connectors
    .filter(
      ({ session }) =>
        session && session.walletConnector && session.walletConnector.connected,
    )
    .map(({ session, walletName, walletId, connectedTime }) => ({
      walletName,
      walletId,
      connectedTime,
      session: {
        ...session.walletConnector.session,
        autosign: session.autosign,
      },
    }));
  storage.set(WALLETCONNECT_SESSIONS, JSON.stringify(sessions));
};

class WalletConnect {
  autosign = false;

  constructor(options, existing) {
    if (options.session.autosign) {
      this.autosign = options.session.autosign;
    }

    this.walletConnector = new RNWalletConnect({
      ...options,
      ...NATIVE_OPTION,
    });
    /**
     *  Subscribe to session requests
     */
    this.walletConnector.on('session_request', async (error, payload) => {
      if (error) {
        throw error;
      }

      try {
        const sessionData = {
          ...payload.params[0],
          autosign: this.autosign,
        };

        navigation.navigate(SCREEN_NAME.walletConnectConfirm, {
          peerId: sessionData.peerId,
          peerMeta: sessionData.peerMeta,
          payload: sessionData,
        });
      } catch (e) {
        this.walletConnector.rejectSession();
        navigation.goBack();
      }
    });

    this.walletConnector.on('call_request', async (error, payload) => {
      if (tempCallIds.includes(payload.id)) return;
      tempCallIds.push(payload.id);
      if (error) {
        throw error;
      }
      const method = payload.method;
      const { peerMeta, peerId, _chainId } = this.walletConnector;

      if (method) {
        try {
          if (method.includes('eth_sendTransaction')) {
            navigation.navigate(SCREEN_NAME.confirmTransaction, {
              peerId,
              peerMeta,
              chainId: _chainId,
              payload,
            });
          }
          if (method.includes('sign')) {
            navigation.navigate(SCREEN_NAME.signatureRequest, {
              peerId,
              peerMeta,
              chainId: _chainId,
              payload,
            });
          }
        } catch (err) {
          this.rejectRequest({
            id: payload.id,
            error: err,
          });
        }
        return;
      }

      // Clean call ids
      tempCallIds.length = 0;
    });

    /**
     *	Subscribe to disconnect
     */
    this.walletConnector.on('disconnect', error => {
      if (error) {
        throw error;
      }
      persistSessions().finally(() => {
        dispatch(updateLoading(true));
      });
    });

    this.walletConnector.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }
    });
  }

  approveRequest = ({ id, result }) => {
    try {
      this.walletConnector.approveRequest({
        id,
        result,
      });
    } catch (error) {
      this.rejectRequest({
        id: id,
        error,
      });
    }
  };

  rejectSession = option => {
    this.walletConnector.rejectSession(option);
  };

  rejectRequest = ({ id, error }) => {
    this.walletConnector.rejectRequest({
      id,
      error,
    });
  };

  updateSession = ({ chainId, accounts }) => {
    try {
      this.walletConnector.updateSession({
        chainId,
        accounts,
      });
    } catch (error) {
      this.rejectSession();
    }
  };

  startSession = async (sessionData, chainIdDApp, existing) => {
    const { chainId, accounts } = sessionData;
    const approveData = {
      chainId: parseInt(chainId, 10),
      accounts: accounts,
    };

    if (existing) {
      this.walletConnector.updateSession(approveData);
    } else {
      this.walletConnector.approveSession(approveData);
    }
    if (chainIdDApp !== chainId || !chainId) {
      this.walletConnector.killSession();
    }
    persistSessions();
  };

  killSession = async () => {
    this.walletConnector.killSession();
    this.walletConnector = null;
  };
}

const instance = {
  setNavigation(data) {
    navigation = data;
  },
  async init() {
    const sessionData = await storage.getString(WALLETCONNECT_SESSIONS);
    if (sessionData) {
      const sessions = JSON.parse(sessionData);
      connectors = sessions.map(
        ({ session, walletName, connectedTime, walletId }) => ({
          walletId,
          walletName,
          connectedTime,
          session: new WalletConnect({ session: session }, true),
        }),
      );
    }
  },
  connectors() {
    return connectors;
  },
  newSession(uri, autosign) {
    const alreadyConnected = this.isSessionConnected(uri);
    const currentWalletName = storage.getString(CONSTANTS.firstWalletNameKey);
    const walletId = getWalletId();
    const currentTime = new Date();
    if (!alreadyConnected) {
      const data = { uri, session: {} };
      if (autosign) {
        data.session.autosign = autosign;
      }
      const newConnector = new WalletConnect(data);
      connectors.push({
        walletId,
        connectedTime: currentTime,
        walletName: currentWalletName,
        session: newConnector,
      });
    }
  },
  updateInfoSession(newSessionInfo, peerId) {
    if (typeof newSessionInfo === 'object' && peerId) {
      connectors = connectors.map(connector => {
        if (connector?.session?.walletConnector?.session?.peerId === peerId) {
          return {
            ...connector,
            ...newSessionInfo,
          };
        }
        return connector;
      });
    }
  },

  updateSession(data, walletName) {
    connectors = connectors.map(connector => {
      const currentChainId = connector?.session?.walletConnector?._chainId;
      const newInfo = data.find(item => item?.chainId === currentChainId);
      if (newInfo) {
        connector.session.updateSession({
          chainId: currentChainId,
          accounts: [newInfo?.address],
        });
        return {
          ...connector,
          walletId: newInfo?.id_token,
          walletName,
        };
      } else {
        connector.session.killSession();
        return;
      }
    });
    connectors = connectors.filter(connector => Boolean(connector?.session));
    persistSessions();
  },

  getSessions: async () => {
    let sessions = [];
    const sessionData = storage.getString(WALLETCONNECT_SESSIONS);
    if (sessionData) {
      sessions = JSON.parse(sessionData);
    }
    return sessions;
  },
  rejectSession: async peerId => {
    if (peerId) {
      const connectorToReject = connectors.find(
        ({ session }) =>
          session &&
          session.walletConnector &&
          session.walletConnector.session.peerId === peerId,
      );
      connectorToReject.session.rejectSession({
        message: 'Failed to setup the network',
      });
    }
  },
  approveSession: async (sessionData, peerId, chainIdDApp) => {
    if (peerId) {
      const connectorToApprove = connectors.find(
        ({ session }) =>
          session &&
          session.walletConnector &&
          session.walletConnector.session.peerId === peerId,
      );
      connectorToApprove.session.startSession(sessionData, chainIdDApp, false);
    }
  },
  approveSignRequest: async (peerId, requestId, unsignedHash, chainId) => {
    if (peerId && requestId && unsignedHash && chainId) {
      const connectorToApprove = connectors.find(
        ({ session }) =>
          session &&
          session.walletConnector &&
          session.walletConnector.session.peerId === peerId,
      );
      const privateKey = await getPrivateKey(connectorToApprove?.walletId);
      const provider = getProvider(chainId);
      const hash = provider.eth.accounts.sign(unsignedHash, privateKey);

      connectorToApprove?.session?.approveRequest({
        id: requestId,
        result: hash.signature,
      });
    }
  },
  approveRequest: async (peerId, requestId, hash) => {
    if (peerId && requestId && hash) {
      const connectorToApprove = connectors.find(
        ({ session }) =>
          session &&
          session.walletConnector &&
          session.walletConnector.session.peerId === peerId,
      );
      connectorToApprove?.session?.approveRequest({
        id: requestId,
        result: hash,
      });
    }
  },
  rejectRequest: async (peerId, requestId, error) => {
    if (peerId && requestId) {
      const connectorToReject = connectors.find(
        ({ session }) =>
          session &&
          session.walletConnector &&
          session.walletConnector.session.peerId === peerId,
      );
      connectorToReject?.session?.rejectRequest({
        id: requestId,
        error,
      });
    }
  },
  killSession: async id => {
    // 1) First kill the session
    const connectorToKill = connectors.find(
      ({ session }) =>
        session &&
        session.walletConnector &&
        session.walletConnector.session.peerId === id,
    );
    if (connectorToKill) {
      await connectorToKill.session.killSession();
    }
    // 2) Remove from the list of connectors
    connectors = connectors.filter(
      ({ session }) =>
        session &&
        session.walletConnector &&
        session.walletConnector.connected &&
        session.walletConnector.session.peerId !== id,
    );
    // 3) Persist the list
    await persistSessions();
  },
  isValidUri(uri) {
    const result = parseWalletConnectUri(uri);
    if (!result.handshakeTopic || !result.bridge || !result.key) {
      return false;
    }
    return true;
  },
  getValidUriFromDeeplink(uri) {
    const prefix = 'wc://wc?uri=';
    return uri.replace(prefix, '');
  },
  isSessionConnected(uri) {
    const wcUri = parseWalletConnectUri(uri);
    return connectors.some(({ session }) => {
      if (!session.walletConnector) {
        return false;
      }
      const { handshakeTopic, key, connected } = session.walletConnector;

      return (
        handshakeTopic === wcUri.handshakeTopic &&
        key === wcUri.key &&
        connected
      );
    });
  },
};

export default instance;
