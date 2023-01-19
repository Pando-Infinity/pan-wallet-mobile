import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLOR, IMAGES, STRINGS } from '../../../constants';

const SessionsEmpty = ({ style, ...otherProps }) => {
  const { t: getLabel } = useTranslation();

  return (
    <View center row style={[{ alignItems: 'center' }, style]} {...otherProps}>
      <Image source={IMAGES.noOngoingSessionImage} />
      <Text style={styles.noOngoing}>{getLabel(STRINGS.noGoingSession)}</Text>
    </View>
  );
};

SessionsEmpty.propTypes = {
  style: PropTypes.object,
};

export default SessionsEmpty;

const styles = StyleSheet.create({
  noOngoing: {
    color: COLOR.white,
  },
});
