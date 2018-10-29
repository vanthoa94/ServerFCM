/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableHighlight, ToastAndroid } from 'react-native';
import FCM from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Listeners";

registerKilledListener();

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

let firebase = null;

export default class App extends Component {

  constructor(props) {
    super(props);

    console.ignoredYellowBox = [
      'Setting a timer'
    ];

    this.state = {
      token: "",
      tokenCopyFeedback: ""
    };
  }

  initDB() {
    if (firebase != null)
      return;

    firebase = require("firebase");
    // var config = {
    //     apiKey: "AIzaSyC9aEEMi3G4_1kmD0FDjz_ZdwYeIInc6Ks",
    //     authDomain: "vtth-1038b.firebaseapp.com",
    //     databaseURL: "https://vtth-1038b.firebaseio.com",
    //     projectId: "vtth-1038b",
    //     storageBucket: "vtth-1038b.appspot.com",
    //     messagingSenderId: "1093673526952"
    // };

    var config = {
      apiKey: "AIzaSyBQP_huHuCQdKqlK64iJlymg9_lRM2Rlp0",
      authDomain: "reactnativeapp-3b673.firebaseapp.com",
      databaseURL: "https://reactnativeapp-3b673.firebaseio.com",
      projectId: "reactnativeapp-3b673",
      storageBucket: "reactnativeapp-3b673.appspot.com",
      messagingSenderId: "628664096853"
    };


    firebase.initializeApp(config);
  }

  setToken(_token) {
    this.setState({ token: _token || "" });

    var ref = firebase.database().ref("DeviceToken/" + _token);
    ref.once("value", function (snapshot) {
      if (snapshot.exists() == false) {
        console.log("save token");
        firebase.database().ref("DeviceToken/" + _token).set({ type: 'android' });
      }
    });
  }

  async componentDidMount() {
    //FCM.createNotificationChannel is mandatory for Android targeting >=8. Otherwise you won't see any notification
    FCM.createNotificationChannel({
      id: 'default',
      name: 'Default',
      description: 'used for example',
      priority: 'high'
    })
    registerAppListener(null);
    FCM.getInitialNotification().then(notif => {
      this.setState({
        initNotif: notif
      });
      if (notif && notif.targetScreen === "detail") {
        setTimeout(() => {
          this.props.navigation.navigate("Detail");
        }, 500);
      }
    });

    try {
      let result = await FCM.requestPermissions({
        badge: false,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error(e);
    }

    this.initDB();

    if (this.state.token == "") {
      FCM.getFCMToken().then(token => {
        ToastAndroid.show(token, ToastAndroid.SHORT);
        if (token != null) {
          this.setToken(token);
        } else {
          FCM.on("FCMTokenRefreshed", token => {
            ToastAndroid.show(token, ToastAndroid.SHORT);
            if(token != null) {
              this.setToken(token);
            }
          });
        }
      });

      if (Platform.OS === "ios") {
        FCM.getAPNSToken().then(token => {
          console.log("APNS TOKEN (getFCMToken)", token);
        });
      }
    }

    // topic example
    //FCM.subscribeToTopic('/contact/msg')
    // FCM.unsubscribeFromTopic('sometopic')
  }

  showLocalNotification() {
    FCM.presentLocalNotification({
      channel: 'default',
      id: new Date().valueOf().toString(), // (optional for instant notification)
      title: "Test Notification with action", // as FCM payload
      body: "Force touch to reply", // as FCM payload (required)
      sound: "bell.mp3", // "default" or filename
      priority: "high", // as FCM payload
      click_action: "com.myapp.MyCategory", // as FCM payload - this is used as category identifier on iOS.
      badge: 10, // as FCM payload IOS only, set 0 to clear badges
      number: 10, // Android only
      ticker: "My Notification Ticker", // Android only
      auto_cancel: true, // Android only (default true)
      large_icon:
        "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg", // Android only
      icon: "ic_launcher", // as FCM payload, you can relace this with custom icon you put in mipmap
      big_text: "Show when notification is expanded", // Android only
      sub_text: "This is a subText", // Android only
      color: "red", // Android only
      vibrate: 300, // Android only default: 300, no vibration if you pass 0
      wake_screen: true, // Android only, wake up screen when notification arrives
      group: "group", // Android only
      picture:
        "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png", // Android only bigPicture style
      ongoing: true, // Android only
      my_custom_data: "my_custom_field_value", // extra data you want to throw
      lights: true, // Android only, LED blinking (default false)
      show_in_foreground: true // notification when app is in foreground (local & remote)
    });
  }

  scheduleLocalNotification() {
    FCM.scheduleLocalNotification({
      id: "testnotif",
      fire_date: new Date().getTime() + 5000,
      vibrate: 500,
      title: "Hello",
      body: "Test Scheduled Notification",
      sub_text: "sub text",
      priority: "high",
      large_icon:
        "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg",
      show_in_foreground: true,
      picture:
        "https://firebase.google.com/_static/af7ae4b3fc/images/firebase/lockup.png",
      wake_screen: true,
      extra1: { a: 1 },
      extra2: 1
    });
  }

  showLocalNotificationWithAction() {
    FCM.presentLocalNotification({
      title: "Test Notification with action",
      body: "Force touch to reply",
      priority: "high",
      show_in_foreground: true,
      click_action: "com.myidentifi.fcm.text", // for ios
      android_actions: JSON.stringify([
        {
          id: "view",
          title: "view"
        },
        {
          id: "dismiss",
          title: "dismiss"
        }
      ]) // for android, take syntax similar to ios's. only buttons are supported
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Server</Text>
        <TouchableHighlight onPress={this.scheduleLocalNotification.bind(this)}>
          <Text>Click</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
