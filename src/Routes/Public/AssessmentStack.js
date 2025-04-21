import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Assessment from '../../screens/Assessment/Assessment';
import TestView from '../../screens/Assessment/TestView';
import AnswerKeyView from '../../screens/Assessment/AnswerKeyView';
import TestDetailView from '../../screens/Assessment/TestDetailView';
import Profile from '../../screens/Profile/Profile';

const Stack = createNativeStackNavigator();

const AssessmentStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Assessment" component={Assessment} />
      <Stack.Screen name="TestView" component={TestView} />
      <Stack.Screen name="AnswerKeyView" component={AnswerKeyView} />
      <Stack.Screen name="TestDetailView" component={TestDetailView} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
};

export default AssessmentStack;
