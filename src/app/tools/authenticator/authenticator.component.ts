import { Component, OnInit } from '@angular/core';
import { FirebaseTSApp } from "firebasets/firebasetsApp/firebaseTSApp";
import {FirebaseTSAuth} from "firebasets/firebasetsAuth/firebaseTSAuth";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-authenticator',
  templateUrl: './authenticator.component.html',
  styleUrls: ['./authenticator.component.css']
})
export class AuthenticatorComponent implements OnInit {
  state = AuthenticatorCompState.LOGIN;
  firebaseSetsAuth: FirebaseTSAuth;
  constructor(private bottomSheetRef: MatBottomSheetRef) {
    this.firebaseSetsAuth = new FirebaseTSAuth();
  }

  ngOnInit(): void {
  }

  //Manages the password reset if required
  onResetClick(resetEmail: HTMLInputElement){
    let email = resetEmail.value;
    if(this.isNotEmpty(email)){
      this.firebaseSetsAuth.sendPasswordResetEmail(
   {
          email: email,
          onComplete: (err) =>{
            this.bottomSheetRef.dismiss();
          }
        }
      );
    }
  }

  //Dismisses the login sheet if the login was successful and prints out
  //an error message if the login failed
  onLogin(loginEmail: HTMLInputElement, loginPassword: HTMLInputElement){
    let email = loginEmail.value;
    let password = loginPassword.value;

    if(this.isNotEmpty(email) && this.isNotEmpty(password)){
      this.firebaseSetsAuth.signInWith(
        {
          email: email,
          password: password,
          onComplete: (uc) => {
            this.bottomSheetRef.dismiss();
          },
          onFail: (err) => {
            alert(err)
          }
        }
      );
    }
  }

  //Creates an account for the user in the database
  onRegisterClick(    registerEmail: HTMLInputElement,
                      registerPassword: HTMLInputElement,
                      registerConfirmPassword: HTMLInputElement){

    let email = registerEmail.value;
    let password = registerPassword.value;
    let confirmPassword = registerConfirmPassword.value;

    if(this.isNotEmpty(email) &&
       this.isNotEmpty(password) &&
       this.isNotEmpty(confirmPassword) &&
       this.isAMatch(password, confirmPassword) ){
      this.firebaseSetsAuth.createAccountWith({
        email: email,
        password: password,
        onComplete: (uc) => {
          this.bottomSheetRef.dismiss();
        },
        onFail: (err) => {
          alert("Failed to create account")
        }
      });
    }
  }

  //Checks if a string aint empty
  isNotEmpty(text: string){
    return text != null && text.length > 0;
  }

  //Checks if the password and confirm password match
  isAMatch(text: string, comparedWith:string){
    return text == comparedWith;
  }

  //Changes state if the user needs a new password
  onForgotPasswordClick(){
    this.state = AuthenticatorCompState.FORGOT_PASSWORD;
  }

  //Changes state if the user registers
  onCreateAccountClick(){
    this.state = AuthenticatorCompState.REGISTER;
  }

  //Changes state if the user logs in
  onLoginClick(){
    this.state = AuthenticatorCompState.LOGIN;
  }

  //Returns if the user is in the login stage
  isLoginState(){
    return this.state == AuthenticatorCompState.LOGIN;
  }

  //Returns if the user is in the registring stage
  isRegisterState(){
    return this.state == AuthenticatorCompState.REGISTER;
  }

  //Returns if the user is in the forgot password stage
  isForgotPasswordState(){
    return this.state == AuthenticatorCompState.FORGOT_PASSWORD;
  }

  //Returns current state
  getStateText(){
    switch (this.state){
      case AuthenticatorCompState.LOGIN:
        return "Login";
      case AuthenticatorCompState.REGISTER:
        return "Register";
      case AuthenticatorCompState.FORGOT_PASSWORD:
        return "Forgot Password";
    }
  }

}

//Enum for authenticator states
export enum AuthenticatorCompState{
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD
}
