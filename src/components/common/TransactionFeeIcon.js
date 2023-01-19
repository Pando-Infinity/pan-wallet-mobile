import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity } from 'react-native';
import { ICONS } from 'constants';
import { TransactionFeeModal } from 'components/modals';

const TransactionFeeIcon = ({ chainName }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Image source={ICONS.info} />
      </TouchableOpacity>
      <TransactionFeeModal
        isVisible={isVisible}
        chainName={chainName || 'BSC'} // TODO: Update when handle send transaction
        onClose={() => setIsVisible(false)}
      />
    </>
  );
};

TransactionFeeIcon.propTypes = {
  chainName: PropTypes.string,
};

export default TransactionFeeIcon;
