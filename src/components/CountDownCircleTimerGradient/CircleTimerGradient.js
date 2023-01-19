import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path, LinearGradient, Stop, Defs} from 'react-native-svg';
import {useCountdown} from 'react-native-countdown-circle-timer';
import {APP_THEMES} from '../../constants';
import Const from '../../constants/constants';
import {storage} from '../../databases';

const {COLOR} = APP_THEMES;

function FormatDate(second) {
  return new Date(second * 1000).toISOString().substring(14, 19);
}

export default function CircleTimerGradient({complete = () => {}}) {
  const duration = Const.lockedTime;
  const colorGradientID = Const.myGradientID;
  const colorURL = `url(#${colorGradientID})`;

  const {
    path,
    pathLength,
    stroke,
    strokeDashoffset,
    remainingTime,
    elapsedTime,
    size,
    strokeWidth,
  } = useCountdown({
    isPlaying: true,
    duration,
    colors: colorURL,
    onComplete: complete,
    initialRemainingTime:
      storage.getNumber(Const.remainTimeKey) != undefined
        ? Const.lockedTime - storage.getNumber(Const.remainTimeKey) / 1000
        : Const.lockedTime,
  });
  return (
    <View style={styles.container}>
      <View style={{width: size, height: size, position: 'relative'}}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={Const.myGradientID} x1="1" y1="0" x2="0" y2="0">
              <Stop offset="10%" stopColor={COLOR.circleGradientColor.first} />
              <Stop offset="40%" stopColor={COLOR.circleGradientColor.second} />
              <Stop offset="65%" stopColor={COLOR.circleGradientColor.third} />
              <Stop offset="95%" stopColor={COLOR.circleGradientColor.second} />
            </LinearGradient>
          </Defs>
          <Path
            d={path}
            fill="none"
            stroke={COLOR.circleGradientColor.stroke}
            strokeWidth={strokeWidth}
          />
          {elapsedTime !== duration && (
            <Path
              d={path}
              fill="none"
              stroke={stroke}
              strokeLinecap="butt"
              strokeWidth={strokeWidth}
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
            />
          )}
        </Svg>
        <View style={styles.time}>
          <Text style={{fontSize: 36, color: 'white'}}>
            {FormatDate(remainingTime)}
          </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  time: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});
