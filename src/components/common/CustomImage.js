import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import axios from 'axios';
import { ICONS } from 'constants';

const CustomImage = ({ imageUrl, defaultSource, ...otherProps }) => {
  const [isValidUrl, setIsValidUrl] = useState(false);

  const defaultSourceValue = useMemo(() => {
    return defaultSource || ICONS.emptyNFT;
  }, [defaultSource]);

  const handleCheckImageValidation = useCallback(() => {
    axios
      .get(`${imageUrl}`)
      .then(res => {
        if (res.status === 404) {
          setIsValidUrl(false);
        } else {
          setIsValidUrl(true);
        }
      })
      .catch(() => {
        setIsValidUrl(false);
      });
  }, [imageUrl]);

  useEffect(() => {
    handleCheckImageValidation();
  }, [handleCheckImageValidation]);

  return (
    <Image
      defaultSource={defaultSourceValue}
      source={
        isValidUrl ? { uri: `${imageUrl}` } : imageUrl || defaultSourceValue
      }
      {...otherProps}
    />
  );
};

CustomImage.propTypes = {
  imageUrl: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

CustomImage.defaultProps = {};

export default CustomImage;
