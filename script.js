//var gaf = 'AIzaSyDr3YaJjFL8TXoKid6EhT6OuXICrDxVlk8'
var gaf = 'AIzaSyDr3YaJjFL8TXoKid6EhT6OuXICrDxVlk8'
var gafs = ['AIzaSyBnAa8ZvWoXucHYNn8J5LjKR5L-viCcnY8', 'AIzaSyBRWJwIp50Ll9VjTD5pAjt_6mlb_9UtZss'];
var gc = 0;
var video = 'R3JNq1W7VoE';
var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + gaf + "&videoId=" + video + "&maxResults=100"
var video_uploaded = null;
const MS_48_HOURS = 172800000;

var display = document.getElementById("display")
var nameEL = document.getElementById("name")

var tagged_votes = [];
var comments = []
var table = {
   "A": "Xylophone",
   "B": "Rusty Pipe",
   "C": "Piñata",
   "D": "Propeller Hat",
   "E": "Gummy Worm"
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
   let total_votes = 0;

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
      timestamp = Date.parse(comment.snippet.topLevelComment.snippet.publishedAt) - video_uploaded;

      let votes_raw = [...raw.matchAll(new RegExp("\\[[a-zA-Z]+\\]", 'gi'))]
      let votes = [];
      votes_raw.forEach((v) => votes.push(v[0]));
      if (votes == undefined || votes.length < 1 || votes.length > 1 || votes[0] === undefined) {
         continue
      }
      else {
         if (timestamp < MS_48_HOURS) {
            if (!flags.includes(votes[0])) {
               flags.push(votes[0])
               counts[votes[0]] = 0
            }
            
            tagged_votes.unshift({ timestamp: timestamp, flag: votes[0] });
            counts[votes[0]]++
            total_votes++;
         }
      }
   }

   counts = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .reduce((acc, key) => {
         acc[key] = counts[key];
         return acc;
      }, {});
   
   let real_keys = [];
   let data_points = [];

   for (let key of Object.keys(counts)) {
      clean_key = key.replace('[', '').replace(']', '')
      if (Object.keys(table).includes(clean_key)) {
         let entry = table[clean_key] + ": " + counts[key] + "\n"
         real_keys.push(table[clean_key]);
         data_points.push(counts[key])
         //displayText += entry;
      }
   }
   
   const ctx = document.getElementById('bar_graph');
   console.log(real_keys);
   console.log(data_points);
   new Chart(ctx, {
      type: 'bar',
      data: {
         labels: real_keys,
         datasets: [{
            label: '# of Ballot Casts',
            data: data_points,
            borderWidth: 1
         }]
      },
      options: {
         scales: {
            y: {
               beginAtZero: true
            }
         }
      }
   });
   
   tagged_votes.sort((a, b) => a.timestamp - b.timestamp);
   let bin_count = 96;
   let per_bin = MS_48_HOURS / bin_count;
   let bins = {};
   for (let flag of flags) {
      bins[flag] = new Float32Array(bin_count);
   }
   
   for (let vote of tagged_votes) {
      let bindex = Math.floor(vote.timestamp / per_bin);
      bins[vote.flag][bindex]++; 
   }
   
   let bin_labels = [];
   for (let i = 1; i < bin_count; i++) {
      for (let key of Object.keys(bins)) {
         bins[key][i] += bins[key][i - 1];
      }
      bin_labels.push(`${i / (bin_count / 48)}`);
   }

   
   let line_datasets = [];
   for (let key of Object.keys(bins)) {
      let clean_key = key.replace('[', '').replace(']', '');
      if (Object.keys(table).includes(clean_key)) {
         line_datasets.push({
            label: table[clean_key],
            data: bins[key],
            borderWidth: 1
         });
      }
   }


   
   const ctx2 = document.getElementById('line_graph');
   
   new Chart(ctx2, {
      type: 'line',
      data: {
         labels: bin_labels,
         datasets: line_datasets
      },
      options: {
         scales: {
            y: {
               beginAtZero: true
            }
         }
      }
   });
   display.innerText = `TOTAL BALLOT CASTS: ${total_votes}`;
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
         video_uploaded = Date.parse(data.items[0].snippet.publishedAt);
         console.log(video_uploaded);
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
