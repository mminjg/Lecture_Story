const firebaseConfig = {
  apiKey: "AIzaSyBriqW5bb956O8Mi87iZJKtdNsD4uWGBp4",
  authDomain: "lecture-story.firebaseapp.com",
  databaseURL: "https://lecture-story.firebaseio.com",
  projectId: "lecture-story",
  storageBucket: "lecture-story.appspot.com",
  messagingSenderId: "109177070261",
  appId: "1:109177070261:web:8b6aa71008757f550254fc",
};
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var ui = firebase.auth();

// 렉쳐정보 전달 받기
const courseNO = localStorage.getItem("courseNO");
const courseName = localStorage.getItem("courseName");
const prof = localStorage.getItem("prof");
var semester = localStorage.getItem("semester");

var ref = db.collection(semester).doc(courseNO + "-" + prof).collection("grades");

// 렉처 이름 띄우기
document.getElementById("subject").innerHTML = courseName + "-" + prof;

//차트 section 가리기, 안내 문구 보이기
const chartContainer = document.getElementById("chart-container");
const rankDiv = document.getElementById("rank-div");
const totalDiv = document.getElementById("total-div");
const info = document.getElementById("info");
chartContainer.style.display = "none";
info.style.display = "block";

// 학기 select box의 디폴트 값을 현재 학기로 설정
var semester_value = semester.substring(0, 6);
var select_tag = document.getElementById(semester_value);
select_tag.setAttribute("selected", "selected");

// 로그아웃 함수
function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      // Sign-out successful.
      window.location.href = "login.html";
    })
    .catch(function (error) {
      // An error happened.
    });
}

// 학기 select 박스에서 학기를 변경할 경우 작동하는 함수
function change_tag() {
  location.reload();
  // html에서 학기 이름 따오기
  var tag_choice = document.querySelector(".semester");
  var tag_selected = tag_choice.options[tag_choice.selectedIndex].value;
  tag_selected = tag_selected.replace("-", "_");

  // 학기 이름 저장하고 학기 이름 변경
  localStorage.setItem("semester", tag_selected);
  semester = localStorage.getItem("semester");

  // 바뀐 학기의 타임라인과 포스팅 기본값(최근) 로드
  loadTimelineTags();
}

// 타임라인 띄울 html 공간
var timelineZone = document.getElementById("timelineSec");

// 변화 감지해서 계속 타임라인 로드하는 함수
function loadTimelineTags() {
  var entry = document.createElement("li");

  var timelineRef = db
    .collection(semester)
    .doc(courseNO + "-" + prof)
    .collection("gradeTags");
  // 리스너 생성
  timelineRef
    .orderBy("time", "desc") //시간 내림차순
    .onSnapshot((docSnapshot) => {
      //스냅샷
      timelineZone.innerHTML = ""; //타임라인 뜨는 세션에 HTML 부분 적기
      // db에서 읽으면서 html 코드 추가
      docSnapshot.forEach((doc) => {
        var entry = document.createElement("li");

        var point = document.createElement("div");
        point.setAttribute("class", "point");

        var button = document.createElement("button");
        button.setAttribute("class", "tag");
        var tagNode = document.createTextNode("#" + doc.data().tag);
        button.append(tagNode);

        entry.append(point);
        entry.append(button);

        timelineZone.appendChild(entry);
      });

      // 각 태그 누르면 해당 차트 뜨도록 태그 버튼에다가 이벤트리스너 등록
      var tags = document.querySelectorAll(".tag");
      var tagsNum = tags.length;
      for (var i = 0; i < tagsNum; i++) {
        tags[i].addEventListener("click", check_user);
      }
    });
}

loadTimelineTags();

function check_user(evt) {
  var tagName = evt.currentTarget.innerText;
  tagName = tagName.substring(1, tagName.length);
  // 선택한 태그 글씨 진하게 만들기
  var everyTag = document.querySelectorAll(".tag");
  for (var i = 0; i < everyTag.length; i++) {
    everyTag[i].style.fontWeight = "normal";
  }
  evt.currentTarget.style.fontWeight = "bold";
  // 현재 진행 중인 학기라면 조건에 따라 성적 그래프를 공개함
  if(semester === "2020_2학기") {
    // 선택한 tag와 useId 일치하는 성적이 있는지 확인
    ref.where("tag", "==", tagName).get().then((querySnapshot) => {
      var flag = false;
      var number = 0;
      var userScore;
      querySnapshot.forEach((doc) => {
        number += 1;
        if (doc.data().userId === ui.currentUser.uid) {
          flag = true;
          userScore = doc.data().grade;
        }
      });
      if (flag === false) {
        // 성적을 입력하지 않았다면 알림
        alert("성적을 입력해야 볼 수 있습니다.");
      } else if (number <= 1) {
        // 그래프는 두 명 이상 부터 그리기 가능
        alert("두 명 이상 성적을 입력해야 그래프를 확인할 수 있습니다.");
      } else {
        // tag 성적 정보 가져오기
        ref.where("tag", "==", tagName).get().then((querySnapshot) => {
          var arr = new Array();
          var userRank;
          querySnapshot.forEach((doc) => {
            arr.push(doc.data().grade);
          });
          // 내림차순 정렬해서 등수 구하기
          arr.sort(function (a, b) {
            return b - a;
          });
          for (var i = 0; i < arr.length; i++) {
            if (userScore === arr[i]) {
              userRank = i + 1;
              break;
            }
          }
          info.style.display = "none"; // info 보이지 않게
          google.charts.load("current", { packages: ["corechart"] });
          google.charts.setOnLoadCallback(function () {
            drawChart(arr);
          });
          document.getElementById("rank").innerHTML = userRank;
          document.getElementById("total").innerHTML = arr.length;
          chartContainer.style.display = "block"; // 차트 section을 보이게
          totalDiv.style.display = "none";
        });
      }
    });
  } else{ // 지난학기라면 성적 그래프를 공개함
    // tag 성적 정보 가져오기
    ref.where("tag", "==", tagName).get().then((querySnapshot) => {
      var arr = new Array();
      querySnapshot.forEach((doc) => {
        arr.push(doc.data().grade);
      });
      info.style.display = "none"; // info 보이지 않게
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(function () {
        drawChart(arr);
      });
      document.getElementById("total2").innerHTML = arr.length;
      chartContainer.style.display = "block"; // 차트 section을 보이게
      rankDiv.style.display = "none";
    });
  }
}

// 배열을 받아 차트를 그리는 함수
function drawChart(arr) {
  var array = $.map(arr, function (value, index) {
    return [value];
  });

  // 차트 data table 설정
  var data = new google.visualization.DataTable();
  data.addColumn("string", "Student");
  data.addColumn("number", "Grade");

  var output = [];
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    output.push([String(i), parseInt(item)]);
  }
  data.addRows(output);

  // 차트 옵션 설정
  var options = {
    title: "사람(명), 점수",
    width: $(window).width() * 0.7,
    height: $(window).height() * 0.6,
    colors: ["#AAAAAA"],
    legend: { position: "none" },
    bar: { gap: "50%" },
    histogram: {
      bucketSize: 1,
      maxNumBuckets: 10,
      hideBucketItems: true,
    },
  };
  // 차트 객체 생성, 차트 그리기
  var chart = new google.visualization.Histogram(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
}
