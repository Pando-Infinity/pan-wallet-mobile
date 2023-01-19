import React from 'react';
import PropTypes from 'prop-types';
import { ICONS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import LoadingModal from './LoadingModal';

const WalletCoinLoadingModal = props => {
  const { t: getLabel } = useTranslation();

  return (
    <LoadingModal
      imageSource={ICONS.walletCoin}
      title={getLabel(STRINGS.processing_transaction)}
      subTitle={getLabel(STRINGS.this_shouldn_take_long)}
      {...props}
    />
  );
};

WalletCoinLoadingModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  loadingProps: PropTypes.shape({
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }),
};

export default WalletCoinLoadingModal;
