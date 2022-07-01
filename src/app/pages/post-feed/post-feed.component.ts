import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { CreatePostComponent } from "../../tools/create-post/create-post.component";
import {FirebaseTSFirestore, Limit, OrderBy, Where} from "firebasets/firebasetsFirestore/firebaseTSFirestore";

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {
  firestore = new FirebaseTSFirestore();
  posts: PostData[] = [];
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getPost();
  }

  onCreatePostClick(){
    this.dialog.open(CreatePostComponent);
  }

  getPost(){
    this.firestore.getCollection({
      path: ["Posts"],
      where: [
        // Can be used to display own posts only
        //new Where("creatorID", "==", "S3zRRGZQUdbhpdaX2Ka8trWc2wJ2"),
        new OrderBy("timestamp", "desc"),
        new Limit(10)
      ],
      onComplete: (result) => {
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

}

export interface PostData {
  comment?: string;
  creatorId: string;
  imageUrl: string;
  postId: string;
}
