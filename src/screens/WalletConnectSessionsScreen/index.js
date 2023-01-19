import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import { Container, HeaderLabel } from 'components/common';
import { ConnectNewButton, SessionsEmpty, SessionsList } from './components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { WalletConnector } from 'walletCore';
import { useDispatch, useSelector } from 'react-redux';
import { updateLoading } from 'stores/reducer/walletConnect';
import { refactorConnectorData } from './helper';

const WalletConnectSessionsScreen = () => {
  const { t: getLabel } = useTranslation();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [sessions, setSessions] = useState([]);
  const isReload = useSelector(({ walletConnect }) => walletConnect.loading);

  useEffect(() => {
    WalletConnector.setNavigation(navigation);
  }, [navigation]);

  useEffect(() => {
    if (isFocused || isReload) {
      WalletConnector.init().finally(() => {
        const connectors = WalletConnector.connectors();
        dispatch(updateLoading(false));
        if (connectors) {
          refactorConnectorData(connectors).then(sessions =>
            setSessions(sessions),
          );
        } else {
          setSessions([]);
        }
      });
    }
  }, [isFocused, isReload]);

  return (
    <Container>
      <View style={{ width: '100%' }}>
        <HeaderLabel label={getLabel(STRINGS.wallet_connect_sessions)} />
        <Text style={styles.description}>
          {getLabel(STRINGS.walletConnectSessionsDescription)}
        </Text>
      </View>
      {sessions.length > 0 ? (
        <SessionsList data={sessions} />
      ) : (
        <SessionsEmpty />
      )}
      <ConnectNewButton />
    </Container>
  );
};

WalletConnectSessionsScreen.propTypes = {};

export default WalletConnectSessionsScreen;

const styles = StyleSheet.create({
  description: {
    ...FONTS.t14r,
    marginTop: 24,
    marginBottom: 8,
    color: COLOR.textSecondary,
  },
});
