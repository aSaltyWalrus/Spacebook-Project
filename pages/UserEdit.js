import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            profileData: [],
            profileID: this.props.route.params.id
        }
    }

    componentDidMount() {
      this.unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getProfileData();
      }); 
    }

    getProfileData = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID, {
      'headers': {
        'X-Authorization':  token
      }
    })
    .then((response) => {
      if(response.status === 200){
        return response.json()
      }
      else if(response.status === 401){
        this.props.navigation.navigate("Login");
      }
      else{
        throw 'Error: check server response';
      }
    })
    .then((responseJson) => {
      this.setState({  
        isLoading: false,
        id: responseJson.user_id,
        email: responseJson.email,
        password: responseJson.password,
        firstName: responseJson.first_name,
        secondName: responseJson.last_name,
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }

    editUser = () => {
        let to_send = {
            first_name: this.state.firstName,
            last_name: this.state.secondName,
            email: this.state.email,
            password: this.state.password,
        };

        return fetch("http://localhost:3333/api/1.0.0/user", {
            method: "patch",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(to_send)
        })

        .then((response) => {
            if(response.status === 201){
                //this.props.navigation.push("Profile", {id:item.user_id})
                this
            }else if(response.status === 400){
                throw 'invalid credentials';
            }else{
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

export default SignUp;