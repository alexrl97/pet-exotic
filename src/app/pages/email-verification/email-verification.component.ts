import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from "firebasets/firebasetsAuth/firebaseTSAuth";
import { Router } from "@angular/router";

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {

  auth = new FirebaseTSAuth();
  constructor(private router: Router) { }

  // If the user is signed in and his email is verified the user gets
  // routed to the homepage. Otherwise a verification email gets send out
  ngOnInit(): void {
    if(this.auth.isSignedIn() && !this.auth.getAuth().currentUser.emailVerified){
      this.auth.sendVerificationEmail();
    }
    else{
      this.router.navigate([""]);
    }
  }

  // Method for resending the verification email
  onResendClick(){
    this.auth.sendVerificationEmail();
  }

}
