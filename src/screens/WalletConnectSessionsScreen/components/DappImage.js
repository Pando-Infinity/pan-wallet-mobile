import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS } from 'constants';

const DappImage = ({ source, name, style, imageProps, textProps }) => {
  const { style: imageStyle, ...otherImageProps } = imageProps;
  const {
    style: textStyle,
    textContentProps = {},
    ...otherTextProps
  } = textProps;
  const { style: styleTextContent, ...otherTextContent } = textContentProps;

  const [renderIconUrlError, setRenderIconUrlError] = useState(false);

  if ((renderIconUrlError && name) || !source) {
    return (
      <View
        style={[
          styles.container,
          textStyle,
          style,
          { backgroundColor: COLOR.avatarDapp },
        ]}
        {...otherTextProps}>
        <Text
          style={[
            { color: COLOR.white, ...FONTS.t30b, textTransform: 'uppercase' },
            styleTextContent,
          ]}
          {...otherTextContent}>
          {name?.slice(0, 1)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      style={[styles.container, imageStyle, style]}
      source={{ uri: getIconUrl(source) }}
      onError={() => {
        setRenderIconUrlError(true);
      }}
      {...otherImageProps}
    />
  );
};

DappImage.propTypes = {
  source: PropTypes.string,
  name: PropTypes.string.isRequired,
  imageProps: PropTypes.object,
  textProps: PropTypes.object,
  style: PropTypes.object,
};

DappImage.defaultProps = {
  imageProps: {},
  textProps: {},
};

export default DappImage;

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Get image url from favicon api
 */
const getIconUrl = url => {
  const iconUrl = `https://api.faviconkit.com/${getHost(url)}/64`;
  return iconUrl;
};

/**
 * Return host from url string
 *
 * @param {string} url - String containing url
 * @param {string} defaultProtocol - Protocol string to append to URLs that have none
 * @returns {string} - String corresponding to host
 */
const getHost = (url, defaultProtocol = 'https://') => {
  const hasProtocol = url && url.match(/^[a-z]*:\/\//);
  const urlObj = new URL(hasProtocol ? url : `${defaultProtocol}${url}`);
  const { hostname } = urlObj;
  return hostname;
};
