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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class App extends Component{
	render(){
		return (
			<NavigationContainer independent={true}>
				<Tab.Navigator  screenOptions={{headerShown: false}}>
					<Tab.Screen name="Profile" component={Profile} />
					<Tab.Screen name="User Edit" component={UserEdit} />
					<Tab.Screen name="User Explorer" component={BrowseUsers} />
				</Tab.Navigator>
			</NavigationContainer>
		);
	}
}
/*<Tab.Screen name="Login" component={Login} options={{tabBarShowLabel:false}} />
					<Tab.Screen name="SignUp" component={SignUp} options={{tabBarShowLabel:false}} />*/


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
/*

cc
				<Tab.Navigator>
					<Tab.Screen name="Profile" component={Profile} />
					<Tab.Screen name="Friends" component={Friends} />
				</Tab.Navigator>

*/

export default UserAccess;