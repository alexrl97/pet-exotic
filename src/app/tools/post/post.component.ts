import {Component, Input, OnInit} from '@angular/core';
import {PostData} from "../../pages/post-feed/post-feed.component";
import {FirebaseTSFirestore, Limit, OrderBy, Where} from "firebasets/firebasetsFirestore/firebaseTSFirestore";
import { MatDialog } from "@angular/material/dialog";
import {ReplyComponent} from "../reply/reply.component";
import {AppComponent} from "../../app.component";


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() postData: PostData;
  petName: string;
  petType: string;
  petAge: string;
  canFollow: number;
  canDelete: boolean;
  firestore = new FirebaseTSFirestore();
  unfollowButtonColor = "rgb(220,36,36)";
  followButtonColor = "rgba(0,130,0,1)";

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
      this.getCreatorInfo();
      this.configureButtons();
      this.configureMargins();
  }

  configureButtons(){
    let postData = this.postData;
    let postComponent = this;

    setTimeout(function (){
      let userId = AppComponent.getUserDocument().userId;
        for (var i = 0; i < postData.likedByID.length; i++) {
          if (postData.likedByID[i] === userId && !postData.hidden) {
            document.getElementById("likeIcon" + postData.postId).style.color = "rgba(200,0,0,1)";
          }
        }
        postComponent.setCanFollow(postData.creatorId !== userId);

      if(userId == postData.creatorId && AppComponent.getProfilePage())
        postComponent.setCanDelete(true);

    }, 1);

    this.setFollowButtons();
  }

  configureMargins(){
    let postData = this.postData
    setTimeout(function (){
      if(postData.hidden) {
        document.getElementById("card" + postData.postId).style.marginTop = "2em";
      }
    }, 1);
  }

  setCanFollow(canFollow){
    this.canFollow = canFollow
  }
  setCanDelete(canDelete){
    this.canDelete = canDelete;
  }

  onDeleteClick(postId){
    if(confirm("Are you sure you want to delete this post?"))
      this.firestore.delete({
        path: ["Posts", postId],
        onComplete(){
          document.getElementById("card" + postId).remove();
        }
      });
  }

  setFollowButtons(){

    let postData = this.postData;

    setTimeout(function (){
      let follows =  AppComponent.getUserDocument().follows
      let creatorId = postData.creatorId;
      for( var i = 0; i < follows.length; i++){
        if ( follows[i] === creatorId) {
          document.getElementById("follow"+postData.postId).textContent = "Unfollow";
          document.getElementById("follow"+postData.postId).style.backgroundColor = "rgb(220,36,36)";
        }
      }
    }, 1);
  }

  onFollowClick(creatorId){

    let follows =  this.getFollows();
    let follow = true;

        for (var i = 0; i < follows.length; i++) {
          if (follows[i] === creatorId) {
            follows.splice(i, 1);
            follow = false;
          }
        }
        if(follow){
          follows.push(creatorId);
        }
        this.updateFollowButtons(creatorId, follow);
        this.updateFollows(this.getUserId(), follows);
  }


  updateFollows(currentUserID, follows){

    this.firestore.update({
      path: ["Users", currentUserID],
      data: {
        follows:follows
      },
      onComplete: (result => {

      })
    });
  }

  updateFollowButtons(creatorId, follow){

    this.firestore.getCollection({
      path: ["Posts"],
      where: [
        new Where("creatorId", "==", creatorId),
      ],
      onComplete: (result) => {
        result.docs.forEach(
          post => {
            if(follow){
              document.getElementById("follow"+post.id).textContent = "Unfollow";
              document.getElementById("follow"+post.id).style.backgroundColor = this.unfollowButtonColor;
            }
            else{
              document.getElementById("follow"+post.id).textContent = "Follow";
              document.getElementById("follow"+post.id).style.backgroundColor = this.followButtonColor;
            }
          }
        );
      },
    });
  }


  getFollows(){
    return AppComponent.getUserDocument().follows;
  }

  getUserId(){
    return AppComponent.getUserDocument().userId;
  }

  onReplyClick(){
    this.dialog.open(ReplyComponent, {data: this.postData.postId});
  }

  onLikeClick(postID){
    this.firestore.getDocument({
      path: ["Posts", postID],
      onComplete: result => {
        let postDocument = result.data();
        this.adjustLikes(postID, postDocument['likes']);
      }
    });
  }

  adjustLikes(postID, likes) {
    let newLikeAmount;
    let likeIDs = this.postData.likedByID;
    let userID = AppComponent.getUserDocument().userId;
    let canLike = true;
    let newColor;

    for( var i = 0; i < likeIDs.length; i++){
      if ( likeIDs[i] === userID) {
        canLike = false;
        likeIDs.splice(i, 1);
      }
    }

    if(canLike) {
      newLikeAmount = String(parseInt(likes) + 1)
      newColor = "rgba(200,0,0,1)";
      likeIDs.push(userID);
    }
    else {
      newLikeAmount = String(parseInt(likes) + -1)
      newColor = "rgba(0,130,0,1)"
    }

    this.firestore.update({
      path: ["Posts", postID],
      data: {
        likes: newLikeAmount,
        likedByID: likeIDs
      },
      onComplete: (result => {
        var container = document.getElementById("likeNumber"+postID);
        var content = container.innerHTML;
        container.innerHTML= String(newLikeAmount);
        document.getElementById("likeIcon"+postID).style.color = newColor;
      })
    });
  }

  getCreatorInfo(){
    this.firestore.getDocument({
      path: ["Users", this.postData.creatorId],
      onComplete: result => {
        let userDocument = result.data();
        this.petName = userDocument['publicName'];
        this.petType = userDocument['animalType'];
        this.petAge = userDocument['animalAge'];
      }
    });
  }
}
