import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { CommonModal } from 'components/common';

const ErrorModalView = (props, title, message, buttonLabel) => {
  return (
    <CommonModal
      title={title}
      message={message}
      buttonLabel={buttonLabel}
      {...props}
    />
  );
};

ErrorModalView.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default memo(ErrorModalView);
