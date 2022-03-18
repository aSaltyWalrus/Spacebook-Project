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
        
        <View style={{backgroundColor: '#0c164f', justifyContent: 'space-apart', alignItems: 'center', flex: 1}}>
        <View style={styles.banner}></View>
          <View style={{flex:2}}>
            <View style={{ flex: 1, padding: 15, justifyContent: 'center'}}>
                <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 16}}>EDIT PROFILE</Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.text}>forename</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(firstName) => this.setState({firstName})}
                    value={this.state.firstName}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.text}>surname</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(secondName) => this.setState({secondName})}
                    value={this.state.secondName}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.text}>email</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(email) => this.setState({email})}
                    value={this.state.email}
                />
            </View>

            <View style={styles.container}>
                <Text style={styles.text}>password</Text>
                <TextInput
                    style={styles.formInputs}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
                />
            </View>

            <View style={styles.container}>
                <Button
                    color={'#5643fd'}
                    onPress={() => this.editUser()}
                    title="Commit Changes"
                />
            </View>

            <View style={styles.container}>
                <Button
                    color={'#ba1e68'}
                    onPress={() => this.logout()}
                    title="Logout"
                />
            </View>
          </View>  
          <View style={styles.banner}></View>
        </View>
        

      );
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-evenly',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  banner: {
    flex: 1
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  formInputs: {
    height: 20,
    borderWidth: 1,
    backgroundColor:'#ffffff',
  },
})

export default UserEdit;