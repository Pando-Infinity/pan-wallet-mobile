import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View } from 'react-native';
import SessionItem from './SessionItem';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAME } from '../../../constants';

const SessionsList = ({ data }) => {
  const navigation = useNavigation();

  return (
    <View style={{ flexGrow: 1, width: '100%' }}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <SessionItem
            data={item}
            onPressItem={() =>
              navigation.navigate(SCREEN_NAME.walletConnectConnected, item)
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{
          justifyContent: 'center',
        }}
      />
    </View>
  );
};

SessionsList.propTypes = {
  data: PropTypes.array,
};

SessionsList.defaultProps = {
  data: [],
};

export default SessionsList;
