import 'react-native-gesture-handler';

import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import UserEdit from './pages/UserEdit';
import CameraPage from './pages/CameraPage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class App extends Component{
	render(){
		return (
			<Tab.Navigator  screenOptions={{headerShown: false}}>
				<Tab.Screen name="Profile" component={Profile} />
				<Tab.Screen name="User Edit" component={UserEdit} />
				<Tab.Screen name="Camera Page" component={CameraPage} />
				<Tab.Screen name="User Explorer" component={BrowseUsers} />
			</Tab.Navigator>
		);
	}
}

class BrowseUsers extends Component{
	render(){
		return (
			<Stack.Navigator>
				<Stack.Screen name="Friends" component={Friends} />
				<Stack.Screen name="Other Profile" component={Profile} />
			</Stack.Navigator>
		);
	}
} 

class UserAccess extends Component{
	render(){
		return (
			<NavigationContainer>
				<Stack.Navigator screenOptions={{headerShown: false}}>
					<Stack.Screen name="Login" component={Login} />
					<Stack.Screen name="SignUp" component={SignUp} />
					<Stack.Screen name="App" component={App} />
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
} 

export default UserAccess;