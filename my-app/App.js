import { StatusBar } from 'expo-status-bar';
import { StyleSheet, AppState, Text, View, TouchableOpacity, BackHandler, Alert } from 'react-native';
import  ShowMessage from './component/ShowMessageComponent';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

Notifications.setNotificationHandler({  
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [title, setTitle] = useState("Future title");

  const notificationListener = useRef();
  const responseListener = useRef();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    /* First auth */
    authenticate();
    
    /* App change local auth */
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/background/) && nextAppState === 'active') {
        authenticate();
      }
      appState.current = nextAppState;
    });
    
    /* Notif listener */
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("notification", notification);
      setNotification(notification);
      setTitle(notification.request.content.title);
    });
    
    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
    
    return () => {
      subscription.remove();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function authenticate() {
    const ret = await LocalAuthentication.authenticateAsync();
    console.log("ret", ret);
    if (!ret.success){
      console.log("bad password");
      alert("WARNING wrong password");
      BackHandler.exitApp(); // 
    }
  }

  async function schedulePushNotification() {
    alert("send notification")
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "HI  📬",
        body: 'Here lol',
        data: {  data:' notifications' },
      },
      trigger: { seconds: 2 },
    });
  }
  
  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  return (
    <View style={styles.container}>
      <ShowMessage msg={title}/>
      <View style={styles.info}>
      <Text style={styles.red}>Title: {notification && notification.request.content.title} </Text>
        <Text style = { styles.body}>Body: {notification && notification.request.content.body}</Text>
        <Text>Data {notification && JSON.stringify(notification.request.content.data)} </Text>
      </View>
      <StatusBar style="auto" />
    <TouchableOpacity  onPress={schedulePushNotification} >
      <View style={styles.buttoncontainer}>
        <Text>Press Here</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity  onPress={authenticate} >
      <View style={styles.buttoncontainer}>
        <Text>Press Here</Text>
      </View>
    </TouchableOpacity>
        <Text>{expoPushToken}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttoncontainer :{
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 20,
  },
  info : {
    padding: 30,
    Color: 'blue',
    alignItems: 'center',

    border: '1px solid black',
  },
  red: {
    padding: 15,
    fontWeight: 'bold',
    color: 'red',
    fontSize: 15,
  },
  body: {
    padding: 10,
  }
});
