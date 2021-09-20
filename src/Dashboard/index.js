import React, { Component, createRef } from "react";
import GoogleApi from "./GoogleAPI";
import { loadGoogleScript } from '../lib/GoogleLogin';
// Client ID and API key from the Developer Console
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest","https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets.readonly";


class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            gapi: null,
            googleAuth: null,
            isLoggedIn: false,
            name: '',
            email:'',
            imageUrl:''
        };
        this.ref = {
            authorizeButton: createRef(),
            signoutButton: createRef()
        }
        this.onSuccess = (googleUser) => { // (Ref. 7)
            this.setState({isLoggedIn: true});
            const profile = googleUser.getBasicProfile();
            this.setState({name: profile.getName()});
            this.setState({email: profile.getEmail()});
            this.setState({imageUrl: profile.getImageUrl()});
            console.log(profile.getImageUrl())
            console.log(profile)
        };
        
        this.onFailure = () => {
            this.setState({isLoggedIn: false});
          }
        this.renderSigninButton = (_gapi) => { // (Ref. 6)
            _gapi.signin2.render('google-signin', {
                'scope': 'profile email',
                'width': 240,
                'height': 50,
                'longtitle': true,
                'theme': 'dark',
                'onsuccess': this.onSuccess,
                'onfailure': this.onFailure 
            });
        }
        this.logOut = () => { // (Ref. 8)
        (async() => {
            await this.state.googleAuth.signOut();
            this.setState({isLoggedIn: false});
            this.renderSigninButton(this.state.gapi);
        })();
        };
        this.appendPre = message => {
            var pre = document.getElementById('content');
            var textContent = document.createTextNode(message + '\n');
            pre.appendChild(textContent);
          }
        this.appendPreMetadata = message => {
            var pre = document.getElementById('content2');
            var textContent = document.createTextNode(message + '\n');
            pre.appendChild(textContent);
          }
        this.listMajors = () => {
            let self = this;
            this.state.gapi.client.sheets.spreadsheets.values.get({
              spreadsheetId: '19c59pA9MbLzOzf-ZKK-15dUpRiVyceWAAitZMZrmYgg',
              range: 'Sheet1!A2:Q',
            //   range: 'Class Data!A2:E',
            }).then(function(response) {
              var range = response.result;
              if (range.values.length > 0) {
                self.appendPre('Name, Major:');
                for (let i = 0; i < range.values.length; i++) {
                  var row = range.values[i];
                  // Print columns A and E, which correspond to indices 0 and 4.
                  self.appendPre(row[0] + ', ' + row[4]);
                }
              } else {
                self.appendPre('No data found.');
              }
            }, function(response) {
                self.appendPre('Error: ' + response.result.error.message);
            });
        }
        this.listMetadata = () => {
            let self = this;
            console.log(this.state.gapi.client.drive.files)
            this.state.gapi.client.drive.files.get({
                fileId: '19c59pA9MbLzOzf-ZKK-15dUpRiVyceWAAitZMZrmYgg',
                fields: 'lastModifyingUser'
              //   range: 'Class Data!A2:E',
              }).then(function(response) {
                  console.log(response)
                  var lastUsr = response.result.lastModifyingUser;
                  self.appendPreMetadata('Last modified by:');
                  self.appendPreMetadata(lastUsr.displayName + ' (' + lastUsr.emailAddress + ')');
                // var range = response.result;
                // if (range.values.length > 0) {
                //   self.appendPre('Name, Major:');
                //   for (let i = 0; i < range.values.length; i++) {
                //     var row = range.values[i];
                //     // Print columns A and E, which correspond to indices 0 and 4.
                //     self.appendPre(row[0] + ', ' + row[4]);
                //   }
                // } else {
                //   self.appendPre('No data found.');
                // }
              }, function(response) {
                  self.appendPre('Error: ' + response.result.error.message);
              });
            // this.state.gapi.client.drive.files.list({
            //     'pageSize': 10,
            //     'fields': "nextPageToken, files(id, name)"
            //   }).then(function(response) {
            //     self.appendPreMetadata('Files:');
            //     console.log(response)
            //     var files = response.result.files;
            //     if (files && files.length > 0) {
            //       for (var i = 0; i < files.length; i++) {
            //         var file = files[i];
            //         self.appendPreMetadata(file.name + ' (' + file.id + ')');
            //       }
            //     } else {
            //       self.appendPreMetadata('No files found.');
            //     }
            //   });
        }
        this.updateSigninStatus = isSignedIn =>{
            console.log(isSignedIn)
            if (isSignedIn) {
                this.ref.authorizeButton.current.style.display = 'none';
                this.ref.signoutButton.current.style.display = 'block';
                this.listMajors();
                this.listMetadata();
            } else {
                this.ref.authorizeButton.current.style.display = 'block';
                this.ref.signoutButton.current.style.display = 'none';
            }
        }
        this.handleAuthClick = event => {
            this.state.gapi.auth2.getAuthInstance().signIn();
        }
        this.handleSignoutClick = event => {
            this.state.gapi.auth2.getAuthInstance().signOut();
        }
        this.initClient = () => {
            let self = this;
            this.state.gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
              }).then(function () {
                  console.log("updatesigninstatus")
                  console.log(self)
                // Listen for sign-in state changes.
                // console.log(this.state.gapi.auth2.getAuthInstance().isSignedIn.listen)
                self.state.gapi.auth2.getAuthInstance().isSignedIn.listen(self.updateSigninStatus);
      
                // Handle the initial sign-in state.
                self.updateSigninStatus(self.state.gapi.auth2.getAuthInstance().isSignedIn.get());
                self.ref.authorizeButton.current.onclick = self.handleAuthClick;
                self.ref.signoutButton.current.onclick = self.handleSignoutClick;
              }, function(error) {
                self.appendPre(JSON.stringify(error, null, 2));
              });
        }
    }
    componentDidMount(){
        window.onGoogleScriptLoad = () => { // (Ref. 1)
            const _gapi = window.gapi; // (Ref. 2)
            _gapi.load('client:auth2', this.initClient);
            this.setState({gapi:_gapi});
            
            // _gapi.load('auth2', () => { // (Ref. 3)
            //   (async () => { 
            //     const _googleAuth = await _gapi.auth2.init({ // (Ref. 4)
            //      client_id: googleClientId
            //     });
            //     this.setState({googleAuth: _googleAuth})
            //     this.setState({render: _googleAuth}) // (Ref. 5)
            //     this.renderSigninButton(_gapi); // (Ref. 6)
            //   })();
            // });
          }
          
          // Ensure everything is set before loading the script
          loadGoogleScript(); // (Ref. 9)
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if(this.state.isLoggedIn===true){
            // fetch('https://www.googleapis.com/auth/spreadsheets?client=831709504995-r0k6dqh1obbai6dk626ep5gp86do1g5g.apps.googleusercontent.com')
            // .then(res=>res.json())
            // .then(data=>console.log(data))
            fetch('https://sheets.googleapis.com/v4/spreadsheets/19c59pA9MbLzOzf-ZKK-15dUpRiVyceWAAitZMZrmYgg')
            .then(res=>res.json())
            .then(data=>console.log(data))
        }
    }
    render() {
        console.log(GoogleApi())
        return (
            <React.Fragment>
                <h1>Google Sheet API</h1>
                <div className="googleApi">
      {/* <header className="App-header">
        {!this.state.isLoggedIn &&
          <div id="google-signin"></div>
        }
        
        {this.state.isLoggedIn &&
          <div>
            <div>
              <img src={this.state.imageUrl} alt='profile img'/>
            </div>
            <div>{this.state.name}</div>
            <div>{this.state.email}</div>
            <button className='btn-primary' onClick={this.logOut}>Log Out</button>
          </div>
        }
      </header> */}
      <button id="authorize_button" ref={this.ref.authorizeButton} style={{display: "none"}}>Authorize</button>
    <button id="signout_button" ref={this.ref.signoutButton} style={{display: "none"}}>Sign Out</button>

    <pre id="content2" style={{whiteSpace: "pre-wrap"}}></pre>
    <pre id="content" style={{whiteSpace: "pre-wrap"}}></pre>
    </div>
            </React.Fragment>
        );
    }
}

export default Dashboard;