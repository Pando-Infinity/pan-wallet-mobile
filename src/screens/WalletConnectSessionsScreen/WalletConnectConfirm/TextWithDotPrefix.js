import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { COLOR } from '../../../constants';

const TextWithDotPrefix = ({ content }) => {
  return content ? (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: COLOR.white,
          height: 5,
          width: 5,
          borderRadius: 2.5,
          marginRight: 8,
        }}
      />
      <Text style={{ color: COLOR.white }}>{content}</Text>
    </View>
  ) : (
    <View />
  );
};

TextWithDotPrefix.propTypes = {
  content: PropTypes.string,
};

export default TextWithDotPrefix;
