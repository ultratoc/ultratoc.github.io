var gaf = 'AIzaSyBnAa8ZvWoXucHYNn8J5LjKR5L-viCcnY8'
var video = 'u_Wbj5wTvN0'
var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + gaf + "&videoId=" + video + "&maxResults=100"

var display = document.getElementById("display")
var nameEL = document.getElementById("name")

var comments = []

function commentCrawl(token) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url + (token == null ? "" : "&pageToken=" + token));
  xhr.send();
  xhr.responseType = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const data = xhr.response;
      comments = comments.concat(data.items)
      if (data.nextPageToken == null) {
        postProcess()
      } else {
        commentCrawl(data.nextPageToken)
      }

    } else {
      console.log(`Sad Error: ${xhr.status}`);
    }
  };
}

function postProcess() {
  let commenters = []
  let flags = []
  let counts = {}

  for (let i = 0; i < comments.length; i++) {
    comment = comments[i]

    author = comment.snippet.topLevelComment.snippet.authorChannelId.value
    if (!commenters.includes(author)) {
      commenters.push(author)
    }
    else {
      continue
    }

    raw = comment.snippet.topLevelComment.snippet.textOriginal.toUpperCase()

    votes = [...raw.matchAll(new RegExp("\\[[a-zA-Z0-9]+\\]", 'gi'))][0]

    if (votes == undefined || votes.length > 1) {
      continue
    }
    else {
      if (!flags.includes(votes[0])) {
        flags.push(votes[0])
        counts[votes[0]] = 0
      }

      counts[votes[0]]++
    }
  }

  let displayText = ""
  
  counts = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .reduce((acc, key) => {
      acc[key] = counts[key];
      return acc;
    }, {});
  
  for (let key of Object.keys(counts)) {
    clean_key = key.replace('[', '').replace(']', '')
    displayText += clean_key + ": " + counts[key] + "\n"
  }

  display.innerText = displayText
}

function startProcess() {
  video = document.getElementById("videoID").value
  url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + gaf + "&videoId=" + video + "&maxResults=100"
  getName()
  document.getElementById("videoID").style.display = "none"
  document.getElementById("butt").style.display = "none"
  commentCrawl(null)

  setInterval(function() {
    commentCrawl(null)
  }, 5000)
}

function getName() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?key=" + gaf + "&part=snippet&id=" + video);
  xhr.send();
  xhr.responseType = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const data = xhr.response;
      nameEL.innerText = "COUNTING FOR: \n" + data.items[0].snippet.localized.title
      console.log("goop")
    } else {
      console.log(`Sad Error: ${xhr.status} ${xhr.response}`);
    }
  };
}
