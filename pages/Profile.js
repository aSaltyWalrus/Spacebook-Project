import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, Button } from 'react-native';
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
            isUsersProfile: false,
            profilePostsData: "",
            newPostText: "",
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


    checkLoggedIn = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        if (token == null) {
            this.props.navigation.navigate('Login');
        }
    };


    getProfileData = async () => {
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
                profileData: [responseJson],
            })
            this.getProfilePosts(); // after the personal data is loaded, load the posts data
        })

        .catch((error) => {
            console.log(error);
        })
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
            } else {
                throw 'Error: check server response';
            }
        })

        .then((responseJson) => {
            this.setState({  
                isLoading: false,
                profilePostsData: responseJson,
            })
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
        <View>
          <View>
            <FlatList
              data={this.state.profileData}
              renderItem={({item}) => ( 
                <View>
                  <Text>{item.first_name} {item.last_name}</Text>
                  <Text>Email: {item.email}</Text>
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
              <Text> This is you [discover others button] </Text>
            }

            <View>
              <Text>Create New Post</Text>
              <TextInput
                style={styles.formInputs}
                onChangeText={(newPostText) => this.setState({newPostText})}
                value={this.state.newPostText}
              />
              <Button
                onPress={() => this.createNewPost()}
                title="Post"
              />
            </View>

            <View>
              <Text>Posts</Text>
              <FlatList
                data={this.state.profilePostsData}
                renderItem={({item}) => ( 
                  <View>
                    <Text>{item.author.first_name} {item.author.last_name}</Text>
                    <Text>{item.text}</Text>
                    <Text>Likes: {item.numLikes}</Text>
                    
                    {item.author.user_id == this.state.sessionUserID || this.state.isUsersProfile ?
                      <View>
                        <Button
                          onPress={() => this.deletePost(item.post_id)}
                          title="Delete"
                        />
                      </View>
                      :
                      <View>
                        <Button
                          onPress={() => this.likePost(item.post_id)}
                          title="Like"
                        />
                        <Button
                          onPress={() => this.unlikePost(item.post_id)}
                          title="Unlike"
                        />
                      </View>
                    }
                  </View>
                )}
                keyExtractor={(item, index) => item.post_id}
              />
            </View>
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