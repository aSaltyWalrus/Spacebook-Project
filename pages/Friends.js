import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Friends extends Component{
  constructor(props){
    super(props);

    this.state = {
      sessionToken: "cat",
      isLoading: true,
      friendsData: "",
      friendRequestsData: "",
      profileID: this.props.route.params.id,
      searchField: "",
      hasSearched: false,
      searchData: "",
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getFriendsData();
      this.getFriendRequests();
    }); 
  }


  componentWillUnmount() {
    this.unsubscribe();
  }

  getFriendsData = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    this.setState({sessionToken: token})
    console.log(this.state.sessionToken)
    return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/friends", {
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
        friendsData: responseJson,
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }


  searchUsers() {
    return fetch("http://localhost:3333/api/1.0.0/search/?q=" + this.state.searchField, {
      method: "get",
      headers: {
        'X-Authorization':  this.state.sessionToken
      },
    })
    .then((response) => {
    if(response.status === 200){
        return response.json()
      }
      else if(response.status === 401){
        throw 'Error: not authorized';
      }
      else{
        throw 'Error: check server response';
      }
    })
    .then((responseJson) => {
      this.setState({
        searchData: responseJson,
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }

  getFriendRequests() = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
      'headers': {
        'X-Authorization':  token
      }
    })
    .then((response) => {
      if(response.status === 200){
        return response.json()
      }
      else if(response.status === 401){
        throw 'Error: not authorized';
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
    })
    .catch((error) => {
      console.log(error);
    })
  }


  sendFriendRequest(theirID)  {
    return fetch("http://localhost:3333/api/1.0.0/user/" + theirID + "/friends", {
      method: "post",
      headers: {
        'X-Authorization':  this.state.sessionToken
      },
    })
    .then((response) => {
      if(response.status === 200){
        throw 'success';
      }
      else if(response.status === 401){
        throw 'Error: not authorized';
      }
      else{
        throw 'Error: check server response';
      }
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
            <TextInput
              style={styles.formInputs}
              onChangeText={(searchField) => this.setState({searchField})}
              value={this.state.searchField}
            />
            <Button
              onPress={() => this.searchUsers()}
              title="Search"
            />
            <FlatList
              data={this.state.searchData}
              renderItem={({item}) => ( 
                <View>
                  <Text>Name: {item.user_givenname} {item.user_familyname} </Text>
                  <Text>Email: {item.user_email} </Text>
                  <Button
                    onPress={() => this.props.navigation.push("Profile", {id:item.user_id})}
                    title="View Profile"
                  />
                  <Button
                    onPress={() => this.sendFriendRequest(item.user_id)}
                    title="Add Friend"
                  />
                </View>
              )}
              keyExtractor={(item, index) => item.user_id}
            />
            <Text> Friends </Text>
            <FlatList
              data={this.state.friendsData}
              renderItem={({item}) => ( 
                <View>
                  <Text>Name: {item.user_givenname} {item.user_familyname} </Text>
                  <Text>Email: {item.user_email} </Text>
                  <Button
                    onPress={() => this.props.navigation.push("Profile", {id:item.user_id})}
                    title="View Profile"
                  />
                </View>
              )}
              keyExtractor={(item, index) => item.user_id}
            />
            <Text> Friend Requests </Text>
            <FlatList
              data={this.state.friendRequestsData}
              renderItem={({item}) => ( 
                <View>
                  <Text>Name: {item.first_name} {item.last_name} </Text>
                  <Text>Email: {item.email} </Text>
                  <Button
                    onPress={() => this.props.navigation.push("Profile", {id:item.user_id})}
                    title="View Profile"
                  />
                </View>
              )}
              keyExtractor={(item, index) => item.user_id}
            />
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