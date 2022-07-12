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

  public static getUserDocument(){
    return AppComponent.userDocument;
  }

  public static getProfilePage(){
    return this.profilePage;
  }

  public static setProfilePage(enabled){
    this.profilePage = enabled;
  }

  getUsername(){
    try {
      return AppComponent.userDocument.publicName;
    } catch (error){
      return "";
    }
  }

  public static changeHeaderText(textContent){
    document.getElementById("current_page").textContent = textContent;
  }

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

  onLogoutClick(){
    this.auth.signOut();
    document.getElementById("current_page").textContent = "";
    this.router.navigate([""])
  }

  loggedIn() {
    return this.auth.isSignedIn();
  }

  onLoginClick(){
    this.loginSheet.open(AuthenticatorComponent);
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
  userId: string;
  follows: string[];
}
