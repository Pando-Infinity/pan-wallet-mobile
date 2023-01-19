import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLOR} from '../../constants';

const Background = ({children}) => {
  return (
    <LinearGradient
      locations={[0, 0, 0.58]}
      colors={COLOR.layoutColors}
      style={{flex: 1, backgroundColor: COLOR.layoutBgColor}}>
      {children}
    </LinearGradient>
  );
};
export default Background;
