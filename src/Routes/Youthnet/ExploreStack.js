import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseContentList from '@src/screens/Dashboard/Courses/CourseContentList';
import UnitList from '@src/screens/Dashboard/Courses/UnitList';
import ExploreTab from '../../screens/YouthNet/ExploreTab';
import SkillCenter from '@src/screens/YouthNet/SkillCenter';

const Stack = createNativeStackNavigator();

const ExploreStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ExploreTab"
        component={ExploreTab}
        options={{ lazy: true }} // Lazily load LoadingScreen
      />

      <Stack.Screen
        name="SkillCenter"
        component={SkillCenter}
        options={{ lazy: true }} // Lazily load LoadingScreen
      />
      <Stack.Screen
        name="UnitList"
        component={UnitList}
        options={{ lazy: true }} // Lazily load LoadingScreen
      />
      <Stack.Screen
        name="CourseContentList"
        component={CourseContentList}
        options={{ lazy: true }} // Lazily load LoadingScreen
      />
    </Stack.Navigator>
  );
};

export default ExploreStack;
