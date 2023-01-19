import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS, IMAGES, STRINGS } from 'constants';
import { Container, HeaderLabel } from 'components/common';
import { DappImage } from '../components';
import { useTranslation } from 'react-i18next';
import WalletInfo from './WalletInfo';
import TextWithDotPrefix from './TextWithDotPrefix';
import ActionButton from './ActionButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Loading from 'components/Loading/Loading';
import { WalletConnector } from 'walletCore';
import { getWalletChain, getWalletId } from 'utils/util';
import { DAORepository } from 'databases';
import { checkAvailabilityWallet, getInfoWallet } from '../helper';

const WalletConnectConfirm = () => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();

  const { peerMeta, peerId, payload } = route.params;

  const { chainId } = payload;

  const icon = useMemo(
    () => peerMeta.icons?.[1] ?? peerMeta.icons?.[0],
    [peerMeta],
  );

  const [currentAddressInfo, setCurrentAddressInfo] = useState();
  const [address, setAddress] = useState([]);

  const modalVisibleRef = useRef(true);

  const walletID = getWalletId();
  const walletChain = getWalletChain();

  const handleConfirm = () => {
    WalletConnector.updateInfoSession(
      { walletName: currentAddressInfo.name },
      peerId,
    );
  };

  useLayoutEffect(() => {
    if (!walletID || !walletChain) return;
    const addressList = getInfoWallet(walletID, walletChain);
    const walletAvailability = checkAvailabilityWallet(addressList, chainId);
    if (walletAvailability) {
      modalVisibleRef.current = false;
      setAddress(walletAvailability?.address);
    } else {
      modalVisibleRef.current = false;
      setAddress(addressList?.[0]?.address);
    }
  }, [navigation, walletID, walletChain, peerId]);

  useEffect(() => {
    DAORepository.getAllWallet().then(data => {
      let info = {};
      const availabilityWallet = data.find(item => {
        const list = getInfoWallet(walletID, walletChain);
        const addressInfo = checkAvailabilityWallet(list, chainId);

        info = {
          address: addressInfo?.address,
          chain: addressInfo?.name,
          chainId: addressInfo?.chainId,
        };
        return Boolean(addressInfo && walletID === item._id);
      });
      if (availabilityWallet) {
        info = {
          ...info,
          id: availabilityWallet._id,
          name: availabilityWallet.name,
        };
      } else {
        const listAddress = getInfoWallet(walletID, walletChain);
        const filterAddress = listAddress.filter(item =>
          Boolean(item?.chainId),
        );
        if (filterAddress.length === 0) {
          info = {
            ...info,
            id: walletID,
            name: data[walletID]?.name,
            address: listAddress?.[0]?.address,
            chain: listAddress?.[0]?.name,
            chainId: listAddress?.[0]?.chainId,
          };
        } else {
          info = {
            ...info,
            id: data[0]?._id,
            name: data[0]?.name,
            address: filterAddress?.[0]?.address,
            chain: filterAddress?.[0]?.name,
            chainId: filterAddress?.[0]?.chainId,
          };
        }
      }
      if (!info.chainId) {
        WalletConnector.rejectSession(
          peerId,
          `No RPC Url available for chainId: ${chainId}`,
        );
        navigation.goBack(null);
      } else {
        setCurrentAddressInfo(info);
      }
    });
  }, [navigation, walletID, peerId, chainId]);

  return (
    <>
      {!modalVisibleRef.current && (
        <Container>
          <HeaderLabel
            label={getLabel(STRINGS.walletConnect)}
            hiddenBackButton
          />
          <View style={{ width: '100%', flex: 1 }}>
            <View style={{ alignItems: 'center', marginTop: 34 }}>
              <DappImage
                source={icon}
                name={peerMeta?.name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  marginBottom: 16,
                }}
                textProps={{ textContentProps: { style: { ...FONTS.t30b } } }}
              />
              <Text style={styles.linkDapp}>{peerMeta?.url}</Text>
            </View>
            <Text style={styles.walletConnectLabel}>
              {getLabel(STRINGS.walletConnectConfirmLabel, {
                nameDapp: peerMeta?.name,
              })}
            </Text>
            <WalletInfo currentAddressInfo={currentAddressInfo} />
            <View style={{ alignSelf: 'flex-start' }}>
              <TextWithDotPrefix content={getLabel(STRINGS.connect_policy_1)} />
              <TextWithDotPrefix content={getLabel(STRINGS.connect_policy_2)} />
            </View>
          </View>
          <ActionButton
            address={address}
            onConfirm={handleConfirm}
            chainId={currentAddressInfo?.chainId}
          />
        </Container>
      )}

      <Modal
        isVisible={modalVisibleRef.current}
        backdropOpacity={1}
        customBackdrop={
          <Image
            source={IMAGES.homeBackGround}
            style={{ width: '100%', flex: 1 }}
          />
        }
        transparent={true}
        animationIn="zoomIn"
        animationOut="zoomOut">
        <Loading
          imageSource={IMAGES.clockLoading}
          title={getLabel(STRINGS.gettingInformation)}
        />
      </Modal>
    </>
  );
};

WalletConnectConfirm.propTypes = {};

export default WalletConnectConfirm;

const styles = StyleSheet.create({
  linkDapp: {
    ...FONTS.t14r,
    color: COLOR.textSecondary,
  },
  walletConnectLabel: {
    ...FONTS.t18b,
    color: COLOR.white,
    marginTop: 41,
  },
});
