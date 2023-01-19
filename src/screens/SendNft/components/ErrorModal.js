import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { CommonModal } from 'components/common';
import { STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';

const ErrorModal = props => {
  const { t: getLabel } = useTranslation();

  return (
    <CommonModal
      title={getLabel(STRINGS.error)}
      message={getLabel(STRINGS.something_wrong)}
      buttonLabel={getLabel(STRINGS.ok_got_it)}
      {...props}
    />
  );
};

ErrorModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default memo(ErrorModal);
