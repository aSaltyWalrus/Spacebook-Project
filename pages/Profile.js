import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component{

    constructor(props){
        super(props);
        this.state = {
            sessionToken: "",
            sessionUserID: 0,
            isLoading: true,
            profileData: [],
            profileID: 0,
            profilePhoto: "",
            profilePostsData: "",
            newPostText: "",
        };
    }


    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this.checkLoggedIn(); // verify if the user is logged in
            this.getProfileData(); // if no error with verification, load profile data
        }); 
    }


    componentWillUnmount() {
        this.unsubscribe();
    }


    checkLoggedIn = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        if (token == null) {
            this.props.navigation.navigate('Login');
        }
    };


    getProfileData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const userID = await AsyncStorage.getItem('@id');
        // store the profileID, the session user id and session token for use in further fetch requests
        // if there is not paramaters from the navigation, the profile is the current users
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
            } else if (response.status === 403) {
                this.props.navigation.pop();
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                profileData: [responseJson],
            })
            this.getProfilePicture(); // after the personal data is loaded, load the profile picture
        })

        .catch((error) => {
            console.log(error);
        })
    }

    getProfilePicture() {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/photo", {
            'headers': {
                'X-Authorization':  this.state.sessionToken
            }
        })

        .then((res) => {
            return res.blob();
        })
        .then((resBlob) => {
            let data = URL.createObjectURL(resBlob);
            this.setState({
                profilePhoto: data,
                
            });
            this.getProfilePosts(); // after the profile picture is loaded, load the posts data
        })
        .catch((err) => {
            console.log("error", err)
        });
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
            this.setState({
                tempPhoto: data
            })
        })

        .catch((err) => {
            console.log("error", err)
        });

    }


    getProfilePosts() {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/post", {
            'headers': {
                'X-Authorization':  this.state.sessionToken
            }
        })

        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                throw "Error: not authorized";
            } else if (response.status === 403) {
                this.props.navigation.pop();
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                profilePostsData: responseJson,
                isLoading: false,
            })
            // once all the posts are loaded, set isLoading to false so the profile can display
        })

        .catch((error) => {
            console.log(error);
        })
    }



    createNewPost() {
        let to_send = {
            text: this.state.newPostText,
        };

        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/post", {
            method: "post",
            headers: {
                'X-Authorization':  this.state.sessionToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(to_send)
        })

        .then((response) => {
            if (response.status === 201) {
                this.setState({ newPostText: "" }) // reset the post text
                this.getProfilePosts() // reload profile posts
            } else if(response.status === 401) {
                throw 'Error: not authorised';
            } else {
                throw 'Error: check server response';
            }
        })
       
        .catch((error) => {
            console.log(error);
        })
    }


    deletePost(post_id) {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/post/" + post_id, {
            method: "delete",
            headers: {
                'X-Authorization':  this.state.sessionToken
            },
        })

        .then((response) => {
            if(response.status === 200){
                this.getProfilePosts() // reload profile posts
            } else if (response.status === 401) {
                throw 'Error: not authorised';
            } else if(response.status === 403) {
                throw 'Error: forbidden'; 
            } else {
                throw 'Error: check server response';
            }
        })
       
        .catch((error) => {
            console.log(error);
        })
    }

    // get the id of the post from the FlatList and retrive the profile id from the state
    likePost(post_id) {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/post/" + post_id + "/like", {
            method: "post",
            headers: {
                'X-Authorization':  this.state.sessionToken
            },
        })

        .then((response) => {
            if(response.status === 200){
                this.getProfilePosts() // reload profile posts
            } else if (response.status === 401) {
                throw 'Error: not authorised';
            } else if(response.status === 403) {
                throw 'Error: frobidden'; 
            } else {
                throw 'Error: check server response';
            }
        })
       
        .catch((error) => {
            console.log(error);
        })
    }


    unlikePost(post_id) {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.profileID + "/post/" + post_id + "/like", {
            method: "delete",
            headers: {
                'X-Authorization':  this.state.sessionToken
            },
        })

        .then((response) => {
            if(response.status === 200){
                this.getProfilePosts() // reload profile posts
            } else if (response.status === 401) {
                throw 'Error: not authorised';
            } else if(response.status === 403) {
                throw 'Error: forbidden'; 
            } else {
                throw 'Error: check server response';
            }
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
    } else {
      return (
        <View style={{backgroundColor:'#0c164f', flex:1}}>
          <ScrollView>
            <View>
              <View style={{padding: 10}}>
                <View style={{flexDirection:'row'}}>
                <Image
                  source={{ uri: this.state.profilePhoto, }}
                  style={{ width: 100, height: 100, borderWidth: 1, backgroundColor: '#ffffff' }}
                />
                <FlatList
                  style={{padding: 5}}
                  data={this.state.profileData}
                  renderItem={({item}) => ( 
                    <View>
                      <Text style={styles.buttonText}>{item.first_name} {item.last_name}</Text>
                      <Text style={styles.text}>email: {item.email}</Text>
                      {this.state.sessionUserID == this.state.profileID ?
                        <TouchableOpacity
                          onPress={() => this.props.navigation.push("Friends", {id:this.state.profileID})}
                        >
                          <Text style={styles.buttonText}>View Friends</Text>
                        </TouchableOpacity>
                      :
                        <Text style={styles.text}>This is you</Text>
                      }
                    </View>
                  )}
                  keyExtractor={(item, index) => item.user_id.toString()}
                />
                </View>
            
                <View style={styles.seperator}></View>
                  <View>
                    <Text style={styles.sectionHeaderText}>Create New Post</Text>
                    <TextInput
                      style={styles.formInputs}
                      onChangeText={(newPostText) => this.setState({newPostText})}
                      value={this.state.newPostText}
                    />
              
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => { this.createNewPost(); }}
                    >
                      <Text style={styles.buttonText}>POST</Text>
                    </TouchableOpacity>
                  </View>
                <View style={styles.seperator}></View>
                <View>
                  <Text style={styles.sectionHeaderText}>Posts</Text>
                  <FlatList
                    data={this.state.profilePostsData}
                    renderItem={({item}) => ( 
                      <View style={{borderRadius:5 , padding: 5, backgroundColor: '#0c165f', marginVertical:10}}>
                        <View style={{flexDirection:'row'}}>
                          <Image
                            source={{ uri: null }}// would usually call getUserPicture(item.author.user_id), however the function iisnt finished
                            style={{ width: 50, height: 50, borderWidth: 1,  backgroundColor: '#ffffff' }}
                          />
                          <View style={{marginLeft:10}}>
                            <Text style={styles.text}>{item.author.first_name} {item.author.last_name}</Text>
                            <Text style={styles.text}>{item.timestamp.slice(0,10)}</Text>
                          </View>
                        </View>
                        <View style={{margin:10}}>
                          <Text style={styles.text}>{item.text}</Text>
                        </View>
                        {item.author.user_id == this.state.sessionUserID || this.state.sessionUserID == this.state.profileID ?
                          <View style={styles.likeContianer}>
                            <Text style={styles.likeText}>Likes: {item.numLikes}</Text>
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => { this.deletePost(item.post_id); }}
                            >
                              <Text style={styles.buttonText}>DELETE</Text>
                            </TouchableOpacity>
                          </View>
                          :
                          <View style={styles.likeContianer}>
                            <Text style={styles.likeText}>Likes: {item.numLikes}</Text>
                            <View style={{flexDirection:'row'}}>
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => {this.likePost(item.post_id); }}
                              >
                                <Text style={styles.buttonText}>LIKE</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => { this.unlikePost(item.post_id); }}
                              >
                                <Text style={styles.buttonText}>UNLIKE</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        }
                      </View>
                    )}
                    keyExtractor={(item, index) => item.post_id}
                  />
                </View>
              </View>
          
            </View>
          </ScrollView>
        </View>
      );
    }    
  }

}


const styles = StyleSheet.create({
  seperator: {
    height: 5,
    backgroundColor:'#d3d3d3',
    marginVertical: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#ff7700',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderWidth: 1,
  },
  likeContianer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  likeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  formInputs: {
    flex: 2,
    height: '40%',
    margin: '0.5%',
    borderWidth: 1,
    padding: '0.5%',
    backgroundColor:'#ffffff',
  },
  button: {
    backgroundColor: '#5643fd',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    borderRadius: 5
  },
  text: {
    color: '#ffffff',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sectionHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    marginVertical: 2,
  },
})

export default Profile;