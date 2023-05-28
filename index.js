import { tweetsData as initTweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

// Store tweetsData and recover it from localStorage when unloading and loading the page

let tweetsData =
  JSON.parse(localStorage.getItem("tweetsData")) || initTweetsData;

window.addEventListener("unload", function () {
  localStorage.setItem("tweetsData", JSON.stringify(tweetsData));
});

// Event listener for different click interactions with the page

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.remove) {
    removeTweet(e.target.dataset.remove);
  }
});

function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  render();
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");

  if (tweetInput.value) {
    tweetsData.unshift({
      handle: `@Scrimba`,
      profilePic: `images/scrimbalogo.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });
    render();
    tweetInput.value = "";
  } else {
    tweetInput.focus();
  }
}

function removeTweet(tweetId) {
  const indexToRemove = tweetsData.findIndex(function (tweet) {
    return tweet.uuid === tweetId;
  });
  tweetsData.splice(indexToRemove, 1);
  render();
}

// Add reply when user presses down 'Enter' in the reply textarea

document.addEventListener("keydown", function (e) {
  if (e.target.dataset.newReply) addNewReply(e);
});

function addNewReply(event) {
  const tweetId = event.target.dataset.newReply;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const replyInput = document.getElementById(`reply-input-${tweetId}`);
    // add reply to tweetsData
    const targetTweetObj = tweetsData.filter(function (tweet) {
      return tweet.uuid === tweetId;
    })[0];

    targetTweetObj.replies.unshift({
      handle: `@Scrimba`,
      profilePic: `images/scrimbalogo.png`,
      tweetText: `${replyInput.value}`,
    });

    render();
    handleReplyClick(tweetId);
  }
}

// Functions to render feed content to page

function getFeedHtml() {
  let feedHtml = ``;

  tweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    if (tweet.isLiked) {
      likeIconClass = "liked";
    }

    let retweetIconClass = "";

    if (tweet.isRetweeted) {
      retweetIconClass = "retweeted";
    }

    let repliesHtml = `
<div class="tweet-reply">
  <div class="tweet-inner">
    <img src="images/scrimbalogo.png" class="profile-pic">
    <textarea
      id= "reply-input-${tweet.uuid}" 
      class="reply-input" 
      data-new-reply=${tweet.uuid} 
      placeholder="Write your reply..."
      ></textarea>
  </div>
</div>`;

    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`;
      });
    }

    feedHtml += `
<div class="tweet">
    <i class="fa-solid fa-xmark remove-btn"
    data-remove="${tweet.uuid}"
    ></i>
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`;
  });
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}

render();
