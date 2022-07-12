import { Component, OnInit, Input } from '@angular/core';
import { FirebaseTSFirestore } from "firebasets/firebasetsFirestore/firebaseTSFirestore";
import { FirebaseTSAuth } from "firebasets/firebasetsAuth/firebaseTSAuth";
import {AppComponent} from "../../app.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @Input() show: boolean = false;

  firestore: FirebaseTSFirestore;
  auth: FirebaseTSAuth

  inputAccepted = false;

  constructor() {
    this.firestore = new FirebaseTSFirestore();
    this.auth = new FirebaseTSAuth();
  }

  ngOnInit(): void {
  }

  onContinueClick(nameInput: HTMLInputElement, animalTypeInput: HTMLInputElement, animalAgeNumberInput: HTMLInputElement, animalAgePeriodInput: HTMLSelectElement) {
    let name = nameInput.value;
    let animalType = animalTypeInput.value;
    let animalAgeNumber = animalAgeNumberInput.value;
    let animalAgePeriod = animalAgePeriodInput.value;


    if (name != "" && animalType != "" && (Number(animalAgeNumber) > 0  && Number(animalAgeNumber) <= 300)) {

      let animalAge;

      if(Number(animalAgeNumber) === 1){
        animalAge = animalAgeNumber + " " + animalAgePeriod.slice(0, -1) + " old"
      }
      else{
        animalAge = animalAgeNumber + " " + animalAgePeriod + " old"
      }

      this.firestore.create({    // @ts-ignore
          path: ["Users", this.auth.getAuth().currentUser.uid],
          data: {
            publicName: name,
            animalType: animalType,
            animalAge: animalAge,
            follows: []
          },
          onComplete: (docId => {
            alert("Profile Created")
            nameInput.value = "";
            animalTypeInput.value = "";
            animalAgeNumberInput.value = "";
            animalAgePeriodInput.value = "";
            window.location.reload();
          }),
          onFail: (err) => {

          }
        }
      );
    }
    else{
      if(name === ""){
        document.getElementById("pet_name").style.backgroundColor = "rgb(255,113,113)";
      }
      else{
        document.getElementById("pet_name").style.backgroundColor = "white";
      }
      if(animalType === ""){
        document.getElementById("pet_type").style.backgroundColor = "rgb(255,113,113)";
      }
      else{
        document.getElementById("pet_type").style.backgroundColor = "white";
      }
      if(!((Number(animalAgeNumber) > 0  && Number(animalAgeNumber)))){
        document.getElementById("pet_age_number").style.backgroundColor = "rgb(255,113,113)";
        alert("Age number must be between 1 and 300");
      }
      else{
        document.getElementById("pet_age_number").style.backgroundColor = "white";
      }
    }
  }
}
