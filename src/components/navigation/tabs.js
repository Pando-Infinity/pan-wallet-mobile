import React from 'react';
import { View, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SCREEN_NAME, APP_THEMES, ICONS, STRINGS } from '../../constants';
import { useTranslation } from 'react-i18next';
//import screen:
import HomeScreen from '../../screens/Home/HomeScreen';
import SettingScreen from '../../screens/Setting/SettingScreen';

const Tab = createBottomTabNavigator();
const { COLOR, SIZES, FONTS } = APP_THEMES;

const BottomTabs = () => {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        backBehavior="initialRoute"
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: COLOR.simpleBackground,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: SIZES.height * 0.1,
            elevation: 0,
            width: SIZES.width,
            display: 'flex',
          },
        }}>
        <Tab.Screen
          name={SCREEN_NAME.homeScreen}
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={ICONS.wallet}
                  style={{
                    width: SIZES.iconSize,
                    height: SIZES.iconSize,
                    tintColor: focused ? COLOR.white : COLOR.gray7,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    ...FONTS.t12b,
                    color: focused ? COLOR.white : COLOR.gray7,
                  }}>
                  {t(STRINGS.wallet)}
                </Text>
              </View>
            ),
          }}
        />

        <Tab.Screen
          name={SCREEN_NAME.settingScreen}
          component={SettingScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={ICONS.setting}
                  style={{
                    width: SIZES.iconSize,
                    height: SIZES.iconSize,
                    tintColor: focused ? COLOR.white : COLOR.gray7,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    ...FONTS.t12b,
                    color: focused ? COLOR.white : COLOR.gray7,
                  }}>
                  {t(STRINGS.setting)}
                </Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabs;
