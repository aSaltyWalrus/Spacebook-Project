import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from 'react-native';

class SignUp extends Component{

    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            email: "",
            password: "",
            firstName: "",
            secondName: "",
            id: ""
        }
    }

    createUser = () => {
        console.log("creating user...");
        let to_send = {
            first_name: this.state.firstName,
            last_name: this.state.secondName,
            email: this.state.email,
            password: this.state.password,
        };

        return fetch("http://localhost:3333/api/1.0.0/user", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(to_send)
        })

        // TODO: have the new account load after its created

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
                    onPress={() => this.createUser()}
                    title="Create Account"
                />
            </View>
            
            <StatusBar style="auto" />
        </View>
        </ScrollView>

      );
    }
}

// onPress={ () => navigation.navigate("Profile") }

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

export default SignUp;