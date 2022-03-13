import 'react-native-gesture-handler';

import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Friends from './pages/Friends';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class App extends Component{
	render(){
		return (
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Login" component={Login} />
					<Stack.Screen name="SignUp" component={SignUp} />
					<Stack.Screen name="Profile" component={Profile} />
					<Stack.Screen name="Friends" component={Friends} />
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}

/*

cc
				<Tab.Navigator>
					<Tab.Screen name="Profile" component={Profile} />
					<Tab.Screen name="Friends" component={Friends} />
				</Tab.Navigator>

*/

export default App;