import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Friends extends Component{

    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            friendsData: ""
        }
    }

    componentDidMount() {
      this.getFriendsData();
      this.unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getFriendsData();
      }); 
    }


  componentWillUnmount() {
    this.unsubscribe();
  }

    getFriendsData = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch("http://localhost:3333/api/1.0.0/user/" + 24 + "/friends", {
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
      else if(response.status === 403){
        console.log("can only view the friends of yourself or your friends");
      }
      else{
        throw 'Error: check server response';
      }
    })
    .then((responseJson) => {
      this.setState({  
        isLoading: false,
        friendsData: responseJson,
      })
      console.log(responseJson)
    })
    .catch((error) => {
      console.log(error);
    })
  }


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
    }
    else {
      return (
        <View>
          <View>
            <FlatList
              data={this.state.friendsData}
              renderItem={({item}) => ( 
                <View>
                  <Text>Name: {item.user_givenname} {item.user_familyname} </Text>
                  <Text>Email: {item.user_email} </Text>
                </View>
              )}
              keyExtractor={(item, index) => item.user_id}
            />
            <Text>Test to show the page loaded</Text>
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

export default Friends;