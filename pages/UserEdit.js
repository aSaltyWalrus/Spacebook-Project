import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UserEdit extends Component{

    constructor(props){
        super(props);
        this.state = {
            sessionUserID: 0,
            sessionToken: "",
            isLoading: true,
            firstName: "",
            secondName: "",
            email: "",
            password: "",
            profileData: [],
        }
    }


    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this.getProfileData();
        }); 
    }


    getProfileData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const userID = await AsyncStorage.getItem('@id');
        
        this.setState({
            sessionToken: token,
            sessionUserID: userID,
        })

        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.sessionUserID, {
            'headers': {
                'X-Authorization':  token,
            }
        })

        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                this.props.navigation.navigate("Login");
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                isLoading: false,
                profileData: [responseJson]
            })
        })

        .catch((error) => {
            console.log(error);
        })
    }


    editUser() {
        let to_send = {};

        if (this.state.firstName != "") { to_send['first_name'] = this.state.firstName; }
        if (this.state.secondName != "") { to_send['last_name'] = this.state.secondName; }
        if (this.state.email != "") { to_send['email'] = this.state.email; }
        if (this.state.password != "") { to_send['password'] = this.state.password; }

        console.log(JSON.stringify(to_send));

        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.sessionUserID, {
            method: "PATCH",
            headers: {
                'X-Authorization':  this.state.sessionToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(to_send)
        })

        .then((response) => {
            if (response.status === 200) {
                this.setState({  
                    firstName: "",
                    secondName: "",
                    email: "",
                    password: "",
                })
            } else if (response.status === 400) {
                throw 'invalid credentials';
            } else {
                throw 'unknown error';
            }
        })
       
        .catch((error) => {
            console.log(error);
        })
    }


    logout() {
        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: "post",
            headers: {
                'X-Authorization':  this.state.sessionToken,
            },
        })
        
       .then((response) => {
            if (response.status === 200){
                this.props.navigation.navigate("Login");
            } else if (response.status === 401){
                throw 'Error: not authorised';
            } else {
                throw 'unknown error';
            }
        })

       .catch((error) => {
            console.log(error);
       })
    }


    render(){

      const navigation = this.props.navigation;

      return (
        <ScrollView>
        <View style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.formTitles}>Edit Profile</Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.formTitles}>forename</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(firstName) => this.setState({firstName})}
                    value={this.state.firstName}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.formTitles}>surname</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(secondName) => this.setState({secondName})}
                    value={this.state.secondName}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.formTitles}>email</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(email) => this.setState({email})}
                    value={this.state.email}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.formTitles}>password</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
                />
            </View>

            <View style={styles.container}>
                <Button
                    onPress={() => this.editUser()}
                    title="Commit Changes"
                />
            </View>

            <View style={styles.container}>
                <Button
                    onPress={() => this.logout()}
                    title="Logout"
                />
            </View>
            
            <StatusBar style="auto" />
        </View>
        </ScrollView>

      );
    }
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#fff000',
  },
  container: {
    flex: 1,
    backgroundColor: '#ff7700',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderWidth: 1,
  },
  formTitles: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: '100%'
  },
  formInputs: {
    flex: 1,
    height: '40%',
    margin: '0.5%',
    borderWidth: 1,
    padding: '0.5%',
  },
})

export default UserEdit;