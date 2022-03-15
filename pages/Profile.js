import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component{

    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
             profileData: [],
            profileID: 0,
            isUsersProfile: false
        };
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this.checkLoggedIn();
            this.getProfileData();
        }); 
    }


    componentWillUnmount() {
        this.unsubscribe();
    }


    getProfileData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const userID = await AsyncStorage.getItem('@id');

        if (this.props.route.params != null) {
            this.setState({
                profileID: this.props.route.params.id,
                sessionToken: token
            })
        } else {
            this.setState({
                profileID: userID,
                sessionToken: token,
            })
        } 
        if (this.state.profileID == userID) {
            this.setState({
                isUsersProfile: true
            })
        }

        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID, {
            'headers': {
                'X-Authorization':  token
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
                profileData: [responseJson],
            })
        })

        .catch((error) => {
            console.log(error);
        })
    }

    getProfilePosts = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID, {
            'headers': {
                'X-Authorization':  token
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
                profileData: [responseJson],
            })
        })

        .catch((error) => {
            console.log(error);
        })
    }



    checkLoggedIn = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        if (token == null) {
            this.props.navigation.navigate('Login');
        }
    };


  render(){
    if (this.state.isLoading) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
          <Text>Loading..</Text>
        </View>
      );
    } else {
      return (
        <View>
          <View>
            <FlatList
              data={this.state.profileData}
              renderItem={({item}) => ( 
                <View>
                  <Text>{item.first_name}</Text>
                </View>
              )}
              keyExtractor={(item, index) => item.user_id.toString()}
            />

            {!this.state.isUsersProfile ?
              <Button
                onPress={() => this.props.navigation.push("Friends", {id:this.state.profileID})}
                title="Friends"
              />
              :
              <Text> This is you </Text>
            }
          </View>
        </View>
      );
    }    
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

export default Profile;