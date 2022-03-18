import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Button } from 'react-native';
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
        
       .then((response) => {
            if (response.status === 200){
                return response.json()
            } else if (response.status === 400){
                throw 'incorrect login credentials';
            } else {
                throw 'unknown error';
            }
        })
        
       .then( async (responseJson) => {
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
      <View style={styles.screen}>
          <View style={styles.banner}></View>
          <View style={styles.mainContainer}>

            <View style={styles.container}>
              <Text style={styles.mainTitle}>SPACEBOOK</Text>
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
                    color={'#5643fd'}
                    onPress={ () => navigation.navigate("SignUp") }
                    title="Sign Up"
                />
                <Button
                    color={'#5643fd'}
                    onPress={() => this.signIn()}
                    title="Login"
                />
            </View>
            
            <StatusBar style="auto" />

          </View>
          <View style={styles.banner}></View>
        </View>
      );
    }
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: '#0c164f',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  banner: {
        flex: 1
  },
    container: {
    flex: 2,
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 2,
    alignSelf: 'center',
    padding: '5%',
    flexDirection: 'row',
    borderWidth: 1,
  },
  mainTitle: {
    flex: 16,
    fontFamily: 'Roboto',
    fontSize: '100%',
    color: '#ffffff',
    alignSelf: 'center',
  },
  formTitles: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: '100%',
    color: '#ffffff',
    alignSelf: 'center',
  },
  formInputs: {
    flex: 1,
    height: '40%',
    margin: '0.5%',
    borderWidth: 1,
    padding: '0.5%',
    backgroundColor: '#ffffff',
  },
})

export default Login;