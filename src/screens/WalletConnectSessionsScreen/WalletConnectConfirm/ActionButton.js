import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import { IMAGES, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import Loading from 'components/Loading/Loading';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WalletConnector } from 'walletCore';
import { RejectAndConfirmButton } from 'components/common';

const ActionButton = ({ address, chainId, onConfirm }) => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();

  const { peerId, payload } = route.params;

  const chainIdDApp = payload.chainId;

  const modalVisibleRef = useRef(false);
  const backdropOpacityRef = useRef(1);

  const isLoading = useMemo(() => {
    return !address || !peerId;
  }, [address, peerId]);

  const handleSessionRequest = () => {
    modalVisibleRef.current = true;
    if (isLoading) return;
    const response = {
      accounts: [address],
      chainId,
    };
    if (!chainId || !address) {
      WalletConnector.rejectSession(
        peerId,
        `No RPC Url available for chainId: ${chainIdDApp}`,
      ).finally(() => {
        navigation.goBack(null);
      });
    } else {
      onConfirm && onConfirm();
      WalletConnector.approveSession(response, peerId, chainIdDApp).finally(
        () => {
          navigation.goBack(null);
          modalVisibleRef.current = false;
        },
      );
    }
  };

  const handleRejectRequest = () => {
    WalletConnector.killSession(peerId).finally(() => {
      navigation.goBack(null);
    });
  };

  return (
    <>
      <RejectAndConfirmButton
        onReject={handleRejectRequest}
        onConfirm={handleSessionRequest}
      />
      <Modal
        isVisible={Boolean(modalVisibleRef.current) || isLoading}
        backdropOpacity={backdropOpacityRef.current}
        transparent={true}
        animationIn="zoomIn"
        animationOut="zoomOut">
        <Loading
          imageSource={IMAGES.connectingSession}
          title={getLabel(STRINGS.connecting)}
          supTitle={getLabel(STRINGS.this_shouldn_take_long)}
        />
      </Modal>
    </>
  );
};

ActionButton.propTypes = {
  address: PropTypes.string,
  onConfirm: PropTypes.func,
  chainId: PropTypes.number,
};

export default ActionButton;
