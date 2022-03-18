import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button,  TouchableOpacity, Image, ScrollView  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Friends extends Component{
    constructor(props){
        super(props);
        this.state = {
            sessionToken: "",
            isLoading: true,
            friendsData: "",
            friendRequestsData: "",
            profileID: 0,
            searchField: "",
            hasSearched: false,
            searchData: "",
            sessionUserID: 0
        }
    }


    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this.getFriendsData();
        }); 
    }


    componentWillUnmount() {
        this.unsubscribe();
    }


    getFriendsData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const userID = await AsyncStorage.getItem('@id');

        if (this.props.route.params != null) {
            this.setState({
                profileID: this.props.route.params.id,
                sessionToken: token,
                sessionUserID: userID,
            })
        } else {
            this.setState({
                profileID: userID,
                sessionToken: token,
                sessionUserID: userID,
            })
        }

        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/friends", {
            'headers': {
                'X-Authorization':  token
            }
        })

        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                this.props.navigation.navigate("Login");
            } else if (response.status === 403) {
                console.log("can only view the friends of yourself or your friends");
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                friendsData: responseJson,
            })
            this.getFriendRequests(); // after the friend data is loaded, load the friend request data
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
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                throw 'Error: not authorized';
            } else {
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


    getFriendRequests() {
        return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
            'headers': {
                'X-Authorization':  this.state.sessionToken
            }
        })

        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                throw 'Error: not authorized';
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                isLoading: false,
                friendRequestsData: responseJson,
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
            if (response.status === 20) {
                throw 'success';
            } else if (response.status === 401) {
                throw 'Error: not authorized';
            } else if (response.status === 403) {
                throw 'Error: already sent request';
            } else {
                throw 'Error: check server response';
            }
        })
    }


    acceptFriendRequest(theirID)  {
        return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + theirID, {
            method: "post",
            headers: {
                'X-Authorization':  this.state.sessionToken
            },
        })

        .then((response) => {
            if (response.status === 200) {
                this.getFriendsData(); // reload friends
                this.getFriendRequests(); // reload requests
                throw 'success';
            } else if (response.status === 401) {
                throw 'Error: not authorized';
            } else {
                throw 'Error: check server response';
            }
        })
    }


    rejectFriendRequest(theirID)  {
        return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + theirID, {
            method: "delete",
            headers: {
                'X-Authorization':  this.state.sessionToken
            },
        })

        .then((response) => {
            if (response.status === 200) {
                this.getFriendRequests(); // reload requests
                throw 'success';
            } else if (response.status === 401) {
                throw 'Error: not authorized';
            } else {
                throw 'Error: check server response';
            }
        })
    }

    // unfinished function
    getUserPicture(user_id) {
        return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/photo", {
            'headers': {
                'X-Authorization':  this.state.sessionToken
            }
        })

        .then((res) => {
            return res.blob();
        })

        .then((resBlob) => {
            let data = URL.createObjectURL(resBlob);
            return data;
        })

        .catch((err) => {
            console.log("error", err)
        });

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
    } else {
      return (
        <View style={{backgroundColor:'#0c164f', flex:1}}>
          <ScrollView>
            <View style={{backgroundColor:'#0c164f'}}>
              <Text style={styles.sectionHeaderText}> Search Users </Text>
              <View>
                <View style={styles.searchbarContianer}>
                  <TextInput
                    style={styles.formInputs}
                    onChangeText={(searchField) => this.setState({searchField})}
                    value={this.state.searchField}
                  />
                  <View style={{flexDirection:'row'}}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => { this.searchUsers() }}
                    >
                      <Text style={styles.buttonText}>SEARCH</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
              data={this.state.searchData}
              renderItem={({item}) => ( 
                <View style={styles.userContainer}>
                  <View style={{flex:1,flexDirection:'row'}}>
                    <View style={styles.userDataContainer}>
                      <Image
                        source={{ uri: null }}// would usually call getUserPicture(item.user_id), however the function iisnt finished
                        style={styles.image}
                      />
                      <View style={{marginLeft: 10}}>
                        <Text style={styles.text}>{item.user_givenname} {item.user_familyname}</Text>
                        <Text style={styles.text}>{item.user_email}</Text>
                      </View>
                    </View>
                    <View>
                      {this.state.sessionUserID == item.user_id ?
                        <View style={styles.userButtons}>
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.props.navigation.navigate("Profile", {id:item.user_id}) }}
                          >
                            <Text style={styles.buttonText}>YOUR PROFILE</Text>
                          </TouchableOpacity>
                        </View>
                      :
                        <View  style={{alignSelf:'flex-end'}}>
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.props.navigation.push("User", {id:item.user_id}) }}
                          >
                            <Text style={styles.buttonText}>VIEW PROFILE</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.sendFriendRequest(item.user_id) }}
                          >
                            <Text style={styles.buttonText}>ADD FRIEND</Text>
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
                  </View>
                </View>
                )}
                keyExtractor={(item, index) => item.user_id}
              />

              <Text style={styles.sectionHeaderText}> Friends </Text>
              <FlatList
                data={this.state.friendsData}
                renderItem={({item}) => ( 
                  <View style={styles.userContainer}>
                    <View style={{flex:1,flexDirection:'row'}}>
                      <View style={styles.userDataContainer}>
                        <Image
                          source={{ uri:  null }}// would usually call getUserPicture(item.user_id), however the function iisnt finished
                          style={styles.image}
                        />
                        <View style={{marginLeft: 10}}>
                          <Text style={styles.text}>{item.user_givenname} {item.user_familyname}</Text>
                          <Text style={styles.text}>{item.user_email}</Text>
                        </View>
                      </View>
                      <View style={styles.userButtons}>
                        {this.state.sessionUserID == item.user_id ?
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.props.navigation.navigate("Profile", {id:item.user_id}) }}
                          >
                            <Text style={styles.buttonText}>YOUR PROFILE</Text>
                          </TouchableOpacity>
                        :
                          <View>
                            {this.state.sessionUserID == this.state.profileID ?
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => { this.props.navigation.push("User", {id:item.user_id}) }}
                              >
                                <Text style={styles.buttonText}>VIEW PROFILE</Text>
                              </TouchableOpacity>
                            :
                              <View>
                                <TouchableOpacity
                                  style={styles.button}
                                  onPress={() => { this.props.navigation.push("User", {id:item.user_id}) }}
                                >
                                  <Text style={styles.buttonText}>VIEW PROFILE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.button}
                                  onPress={() => { this.sendFriendRequest(item.user_id) }}
                                >
                                  <Text style={styles.buttonText}>ADD FRIEND</Text>
                                </TouchableOpacity>
                              </View>
                            }
                          </View> 
                        }
                      </View>
                    </View>
                  </View>
                )}
                keyExtractor={(item, index) => item.user_id}
              />

              {this.state.sessionUserID == this.state.profileID ?
                <View>
                  <Text style={styles.sectionHeaderText}> Friend Requests </Text>
                  <FlatList
                    data={this.state.friendRequestsData}
                    renderItem={({item}) => ( 
                      <View style={styles.userContainer}>
                        <View style={{flex:1,flexDirection:'row'}}>
                          <View style={styles.userDataContainer}>
                            <Image
                              source={{ uri:  null }}// would usually call getUserPicture(item.user_id), however the function iisnt finished
                              style={styles.image}
                            />
                            <View style={{marginLeft: 10}}>
                              <Text style={styles.text}>{item.first_name} {item.last_name}</Text>
                              <Text style={styles.text}>{item.email}</Text>
                            </View>
                          </View>
                          <View style={styles.userButtons}>
                            {this.state.sessionUserID == item.user_id ?
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => { this.props.navigation.navigate("Profile", {id:item.user_id}) }}
                              >
                                <Text style={styles.buttonText}>YOUR PROFILE</Text>
                              </TouchableOpacity>
                            :
                              <View>
                                <View style={{flexDirection:'row'}}>
                                  <TouchableOpacity
                                    style={{backgroundColor: '#0e9246', paddingVertical: 5, paddingHorizontal: 10,
                                      alignSelf: 'flex-end', alignItems: 'center', borderRadius: 5}}
                                    onPress={() => { this.acceptFriendRequest(item.user_id) }}
                                  >
                                    <Text style={styles.buttonText}>ACCEPT</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={{backgroundColor: '#ba1e68', paddingVertical: 5, paddingHorizontal: 10,
                                      alignSelf: 'flex-end', alignItems: 'center', borderRadius: 5}}
                                    onPress={() => { this.rejectFriendRequest(item.user_id) }}
                                  >
                                    <Text style={styles.buttonText}>REJECT</Text>
                                  </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                  style={styles.button}
                                  onPress={() => { this.props.navigation.push("User", {id:item.user_id}) }}
                                >
                                  <Text style={styles.buttonText}>VIEW PROFILE</Text>
                                </TouchableOpacity>
                              </View>
                            }
                          </View>
                        </View>
                      </View>
                    )}
                    keyExtractor={(item, index) => item.user_id}
                  />
                </View>
              :
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => { this.props.navigation.popToTop() }}
                >
                  <Text style={styles.buttonText}>BACK TO YOUR FRIENDS</Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </ScrollView>
      </View>
      );
    }    
  }
}

const styles = StyleSheet.create({
  text: {
    color: '#ffffff',
  },
  sectionHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    marginVertical: 2,
    backgroundColor:'#1d1145',
    padding: 3
  },
  formInputs: {
    flex: 1,
    margin: '0.5%',
    borderWidth: 1,
    padding: '0.5%',
    backgroundColor:'#ffffff',
  },
  userContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: '#0c165f',
    marginVertical: 10,
    alignItems: 'space-evenly'
  },
  userDataContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'space-evenly',
    marginLeft: 10
  },
  image: {
    width: 50,
    height: 50,
    borderWidth: 1,
    backgroundColor: '#ffffff'
  },                
  userButtons: {
    flexDirection: 'column',
    alignSelf:'flex-end',
  },
  searchbarContianer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#5643fd',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    borderRadius: 5
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

})

export default Friends;