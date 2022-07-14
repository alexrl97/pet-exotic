import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { CreatePostComponent } from "../../tools/create-post/create-post.component";
import {FirebaseTSFirestore, Limit, OrderBy, Where} from "firebasets/firebasetsFirestore/firebaseTSFirestore";
import {AppComponent} from "../../app.component";
import {PostComponent} from "../../tools/post/post.component";

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {
  firestore = new FirebaseTSFirestore();
  posts: PostData[] = [];
  activeButtonColor = "rgb(220,36,36)";
  inactiveButtonColor = "rgba(0,130,0,1)";
  limit = 200;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getPost("explore");
  }

  onCreatePostClick(){
    this.dialog.open(CreatePostComponent);
  }

  public getPost(feedType){

    let idFilter = [];
    let currentComponent = this;
    this.setActiveButtonColours(feedType);
    if(feedType != "explore") {
      setTimeout(function (){

        if(feedType === "profile") {
          idFilter.push(AppComponent.getUserDocument().userId);
        }

        if(feedType === "friends-feed"){
          idFilter =AppComponent.getUserDocument().follows;
        }
        currentComponent.displayFilteredPosts(idFilter);
      }, AppComponent.getTimeout());
    }
    else{
      this.displayAllPosts();
    }
  }

  displayFilteredPosts(idFilter){

    let hasFollowers = true;

    if(idFilter.length === 0){
      console.log(idFilter);
      idFilter = ["no_follows"];
      alert("Follow other profiles to see their posts here");
    }
    this.firestore.getCollection({
      path: ["Posts"],
      where: [
        new Where("creatorId", "in", idFilter),
        new OrderBy("timestamp", "desc"),
        new Limit(this.limit)
      ],
      onComplete: (result) => {
        this.posts = [];
        result.docs.forEach(
          doc => {
            let post = <PostData>doc.data();
            post.postId = doc.id;
            this.posts.push(post);
          }
        );
      }
    });
  }


  displayAllPosts(){
    this.firestore.getCollection({
      path: ["Posts"],
      where: [
        new OrderBy("timestamp", "desc"),
        new Limit(this.limit)
      ],
      onComplete: (result) => {
        this.posts = [];
        result.docs.forEach(
          doc => {
            let post = <PostData>doc.data();
            post.postId = doc.id;
            this.posts.push(post);
          }
        );
      },
      onFail: err => {

      }
    });
  }

  onFriendsClick(){

    let creators = [];
    this.setActiveButtonColours("friends");

    this.firestore.getCollection({
      path: ["Posts"],
      where: [
        new OrderBy("timestamp", "desc"),
        new Limit(this.limit)
      ],
      onComplete: (result) => {
        this.posts = [];
        result.docs.forEach(
          doc => {
            let post = <PostData>doc.data();
            if((! creators.includes(post.creatorId))
              && post.creatorId != AppComponent.getUserDocument().userId
              && AppComponent.getUserDocument().follows.includes(post.creatorId) ){
              creators.push(post.creatorId);
              post.postId = doc.id;
              post.hidden = true;
              this.posts.push(post);
            }
          }
        );
      },
      onFail: err => {

      }
    });
  }


  setActiveButtonColours(feedType){
    switch (feedType) {

      case "friends-feed":
        document.getElementById("explore-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friendsFeed-button").style.backgroundColor = this.activeButtonColor
        document.getElementById("friends-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("profile-button").style.backgroundColor = this.inactiveButtonColor
        AppComponent.changeHeaderText("FOLLOWED");
        AppComponent.setProfilePage(false);
        break;

      case "friends":
        document.getElementById("explore-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friendsFeed-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friends-button").style.backgroundColor = this.activeButtonColor
        document.getElementById("profile-button").style.backgroundColor = this.inactiveButtonColor
        AppComponent.changeHeaderText("FRIENDS");
        AppComponent.setProfilePage(false);
        break;

      case "profile":
        document.getElementById("explore-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friendsFeed-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friends-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("profile-button").style.backgroundColor = this.activeButtonColor
        AppComponent.changeHeaderText("POSTS");
        AppComponent.setProfilePage(true);
        break;

      default:
        document.getElementById("explore-button").style.backgroundColor = this.activeButtonColor
        document.getElementById("friendsFeed-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("friends-button").style.backgroundColor = this.inactiveButtonColor
        document.getElementById("profile-button").style.backgroundColor = this.inactiveButtonColor
        AppComponent.changeHeaderText("EXPLORE");
        AppComponent.setProfilePage(false);
        break;
    }
  }
}

export interface PostData {
  comment?: string;
  creatorId: string;
  imageUrl: string;
  postId: string;
  likes: string;
  likedByID: string[];
  hidden: boolean
}
