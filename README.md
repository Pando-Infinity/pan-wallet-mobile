# PanWallet app

## Build app

```sh
# Install dependencies
yarn install

# For IOS:
yarn install
cd ./ios && pod install

# Start dev server
## IOS:
  yarn ios
## Special IOS:
  yarn react-native run-ios --simulator='iPhone 11'
## Android:
  yarn android
## Note: If metro bundler not starting automatically, following steps:
  yarn metro
  yarn android
```
