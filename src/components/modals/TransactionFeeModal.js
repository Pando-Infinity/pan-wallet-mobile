import React from 'react';
import PropTypes from 'prop-types';
import { CommonModal } from 'components/common';
import { useTranslation } from 'react-i18next';
import { STRINGS } from 'constants';

const TransactionFeeModal = ({
  isVisible,
  onClose,
  chainName,
  title,
  message,
  buttonLabel,
}) => {
  const { t: getLabel } = useTranslation();

  return (
    <CommonModal
      isVisible={isVisible}
      onClose={onClose}
      title={title || getLabel(STRINGS.transactionFee)}
      message={
        message ||
        getLabel(STRINGS.transactionFeeMessage, {
          chainName: chainName === 'BNB' ? 'BSC' : chainName || '',
        })
      }
      buttonLabel={buttonLabel || getLabel(STRINGS.ok)}
    />
  );
};

TransactionFeeModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
  chainName: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonLabel: PropTypes.string,
};

export default TransactionFeeModal;
