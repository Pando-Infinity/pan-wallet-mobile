import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-native';
import Loading from 'components/Loading/Loading';
import { COLOR, SIZES } from 'constants';

const LoadingModal = ({
  visible,
  imageSource,
  title,
  subTitle,
  loadingProps,
  ...otherProps
}) => {
  const { style, ...otherLoadingProps } = loadingProps;

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropColor={COLOR.black}
      deviceHeight={SIZES.heightScreen}
      transparent
      {...otherProps}>
      <Loading
        imageSource={imageSource}
        title={title}
        supTitle={subTitle}
        style={[{ backgroundColor: COLOR.blackOpacity07 }, style]}
        {...otherLoadingProps}
      />
    </Modal>
  );
};

LoadingModal.propTypes = {
  visible: PropTypes.bool,
  imageSource: PropTypes.string.isRequired,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  loadingProps: PropTypes.shape({
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }),
};

LoadingModal.defaultProps = {
  loadingProps: { style: {} },
};

export default LoadingModal;
