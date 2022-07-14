import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from "firebasets/firebasetsAuth/firebaseTSAuth";
import { FirebaseTSFirestore } from "firebasets/firebasetsFirestore/firebaseTSFirestore";
import { FirebaseTSStorage } from "firebasets/firebasetsStorage/firebaseTSStorage";
import { FirebaseTSApp } from "firebasets/firebasetsApp/firebaseTSApp";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  selectedImageFile: File;
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();
  storage = new FirebaseTSStorage();
  constructor(private dialog: MatDialogRef<CreatePostComponent>) { }

  ngOnInit(): void {
  }

  // Handels the upload when a Post is getting posted
  // Posts without photos are not allowed, while posts without text get trough
  onPostClick(commentInput: HTMLTextAreaElement){
    if(this.selectedImageFile) {
      let comment = commentInput.value;
      let postID = this.firestore.genDocId();
      this.storage.upload({
        uploadName: "upload Image Post",
        path: ["Posts", postID, "image"],
        data: {
          data: this.selectedImageFile
        },
        onComplete: (downloadUrl => {
          this.firestore.create({
            path: ["Posts", postID],
            data: {
              comment: comment,
              creatorId: this.auth.getAuth().currentUser.uid,
              imageUrl: downloadUrl,
              timestamp: FirebaseTSApp.getFirestoreTimestamp(),
              likes: "0",
              likedByID:[]
            },
            onComplete: (docId => {
              this.dialog.close();
              window.location.reload();
            })
          });
        })
      });
    }
    else{
      alert("No photo selected!")
    }
  }

  //Handels the preview for the photo set for an upload, so the user
  //has an additional confirmation of what ge actually posts
  onPhotoSelected(photoSelector: HTMLInputElement){
    this.selectedImageFile = photoSelector.files[0];
    if(!this.selectedImageFile) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(this.selectedImageFile);
    fileReader.addEventListener(
      "loadend",
      ev => {
        let readebleString = fileReader.result.toString();
        let postPreviewImage = <HTMLInputElement> document.getElementById("post-preview-image");
        postPreviewImage.src =readebleString;
      }
    );
  }
}
