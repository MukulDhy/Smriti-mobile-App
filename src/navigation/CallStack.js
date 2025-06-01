import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CallScreen from "../screens/CallScreen";
import IncomingCallScreen from "../screens/IncomingCallScreen";

const Stack = createStackNavigator();

function CallStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CallScreen" component={CallScreen} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
    </Stack.Navigator>
  );
}

export default CallStack;
