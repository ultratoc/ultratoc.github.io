//var gaf = 'AIzaSyDr3YaJjFL8TXoKid6EhT6OuXICrDxVlk8'
var gaf = 'AIzaSyDr3YaJjFL8TXoKid6EhT6OuXICrDxVlk8'
var gafs = ['AIzaSyBnAa8ZvWoXucHYNn8J5LjKR5L-viCcnY8', 'AIzaSyBRWJwIp50Ll9VjTD5pAjt_6mlb_9UtZss'];
var gc = 0;
var video = 'oy9ghhZ0tFs'
var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + gaf + "&videoId=" + video + "&maxResults=100"

var display = document.getElementById("display")
var displayL = document.getElementById("displayL")
var nameEL = document.getElementById("name")

var comments = []
var table = {
  "A": "Cheese Plate",
  "B": "Garlic Bread",
  "C": "Banana Slice",
  "D": "Ham And Cheese Crackers",
  "E": "DVD",
  "1": "Cheese Plate",
  "2": "Garlic Bread",
  "3": "Banana Slice",
  "4": "Ham And Cheese Crackers",
  "5": "DVD"
}

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
      gaf = gafs[gc];
      g++;
      commentCrawl(token);
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

    let votes_raw = [...raw.matchAll(new RegExp("\\[[a-zA-Z0-9]+\\]", 'gi'))]
    let votes = [];
    votes_raw.forEach((v) => votes.push(v[0]));
    if (votes == undefined || votes.length > 2) {
      continue
    } else if (votes.length == 2) {
      let nt1 = isNaN(parseInt(votes[0].replace('[', '').replace(']', '')));
      let nt2 = isNaN(parseInt(votes[1].replace('[', '').replace(']', '')));
      if ((nt1 || nt2) && !(nt1 && nt2)) {
        for (let v of votes) {
          if (!flags.includes(v)) {
            flags.push(v);
            counts[v] = 0
          }

          counts[v]++
        }
      }
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
  let displayLikes = ""

  counts = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .reduce((acc, key) => {
      acc[key] = counts[key];
      return acc;
    }, {});

  for (let key of Object.keys(counts)) {
    clean_key = key.replace('[', '').replace(']', '')
    if (Object.keys(table).includes(clean_key)) {
      let entry = table[clean_key] + ": " + counts[key] + "\n"
      if (isNaN(parseInt(clean_key))) {
        displayText += entry
      } else {
        displayLikes += entry
      }
    }

  }

  display.innerText = displayText
  displayL.innerText = displayLikes
}

function startProcess() {
  //video = document.getElementById("videoID").value
  url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + gaf + "&videoId=" + video + "&maxResults=100"
  getName()
  document.getElementById("videoID").style.display = "none"
  document.getElementById("butt").style.display = "none"
  commentCrawl(null)

  //setInterval(function() {
  //  commentCrawl(null)
  //}, 5000)
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
      gaf = gafs[gc];
      g++;
      getName();
    }
  };
}
startProcess();
