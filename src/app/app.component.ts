import { Component } from '@angular/core';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FirebaseTSAuth } from "firebasets/firebasetsAuth/firebaseTSAuth";
import { AuthenticatorComponent } from "./tools/authenticator/authenticator.component";
import { Router } from "@angular/router";
import { FirebaseTSFirestore } from "firebasets/firebasetsFirestore/firebaseTSFirestore";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pet-exotic';
  auth = new FirebaseTSAuth();
  isLoggedIn = false;
  firestore = new FirebaseTSFirestore();
  userHasProfile = true;
  private static profilePage = false;
  private static userDocument: UserDocument;
  private static timeout = 10;

  //forwards the user to the according pages evaluating his login state
  constructor(private loginSheet: MatBottomSheet, private router: Router) {
    this.auth.listenToSignInStateChanges(
      user => {
        this.auth.checkSignInState(
          {
            whenSignedIn: user => {
              this.router.navigate(["postFeed"]);
            },
            whenSignedOut: user => {
              AppComponent.userDocument = null;
            },
            whenSignedInAndEmailNotVerified: user => {
              this.router.navigate(["emailVerification"])
            },
            whenSignedInAndEmailVerified: user => {
              this.getUserProfile();
            },
          }
        )
      }
    );
  }

  //returns the user document for access in other components
  public static getUserDocument(){
    return AppComponent.userDocument;
  }

  //returns if the user is currently on the Posts/Profile page
  public static getProfilePage(){
    return this.profilePage;
  }

  //return the public timeout in milliseconds waiting for content to load
  public static getTimeout(){
    return this.timeout;
  }

  //makes it accessiable to all components if the user is on the profile page
  public static setProfilePage(enabled){
    this.profilePage = enabled;
  }

  //returns the username
  getUsername(){
    try {
      return AppComponent.userDocument.publicName;
    } catch (error){
      return "";
    }
  }

  //changes the header text according to the section the user selected
  public static changeHeaderText(textContent){
    document.getElementById("current_page").textContent = textContent;
  }

  //routes if the user succesfully created a profile
  getUserProfile(){
    this.firestore.listenToDocument({
      name: "Getting Document",    // @ts-ignore
      path: ["Users", this.auth.getAuth().currentUser.uid],
      onUpdate: (result) => {
        AppComponent.userDocument = <UserDocument>result.data();
        this.userHasProfile = result.exists;
        AppComponent.userDocument.userId = this.auth.getAuth().currentUser.uid;
        if(this.userHasProfile){
          this.router.navigate(["postFeed"]);
        }
      }
    });
  }

  //handels the logout
  onLogoutClick(){
    this.auth.signOut();
    document.getElementById("current_page").textContent = "";
    this.router.navigate([""])
  }

  //returns if the user is currently logged in
  loggedIn() {
    return this.auth.isSignedIn();
  }

  //open the loginSheet when the user clicks on "login"
  onLoginClick(){
    this.loginSheet.open(AuthenticatorComponent);
  }
}

// Exports the UserDocument interface
export interface UserDocument {
  publicName: string;
  description: string;
  userId: string;
  follows: string[];
}
