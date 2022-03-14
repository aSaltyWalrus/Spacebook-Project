import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Login extends Component{

    constructor(props){
        super(props);

        this.state = {
            email: "",
            password: "",
            id: ""
        }
    }


    signIn = () => {
        console.log("signing in...");
        let to_send = {
            email: this.state.email,
            password: this.state.password
        };

        return fetch("http://localhost:3333/api/1.0.0/login", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(to_send)
        })

        // TODO: have the login
        
       .then((response) => {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 400){
                throw 'incorrect login credentials';
            }else{
                throw 'unknown error';
            }
        })
        
       .then(async (responseJson) => {
            console.log(responseJson);
            await AsyncStorage.setItem('@session_token', responseJson.token);
            await AsyncStorage.setItem('@id', responseJson.id);
            this.props.navigation.navigate("App");
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
                <Text style={styles.formTitles}>SPACEBOOK</Text>
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

            <View style={styles.buttonContainer}> 
                <Button
                    onPress={ () => navigation.navigate("SignUp") }
                    title="Sign Up"
                />
                <Button
                    onPress={() => this.signIn()}
                    //onPress={ () => navigation.navigate("Profile") }
                    title="Login"
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ff7700',
    alignItems: 'center',
    justifyContent: 'center',
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

export default Login;