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

// 렉쳐정보 전달 받기
const courseNO = localStorage.getItem("courseNO");
const courseName = localStorage.getItem("courseName");
const prof = localStorage.getItem("prof");
var semester = localStorage.getItem("semester");

// 렉처 이름 띄우기
document.getElementById("subject").innerHTML = courseName + "-" + prof;

// 학기 select box의 디폴트 값을 현재 학기로 설정
var semester_value = semester.substring(0, 6);
var select_tag = document.getElementById(semester_value);
select_tag.setAttribute("selected", "selected");

// firestore 경로
var ref = db.collection("2020_2학기").doc(courseNO + "-" + prof);

// tag 불러오기
window.onload = function () {
  var arr = [];
  ref
    .collection("tags")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        arr.push(doc.data().tag);
      });

      // tag 옵션에 추가
      for (var i = 0; i < arr.length; i++) {
        var option = $("<option>" + arr[i] + "</option>");
        $("#select_tag").append(option);
      }
    });
};

function sub() {
  var selected_tag = document.getElementById("select_tag").value;
  var content = document.getElementById("content").value;
  var add_tag = document.getElementById("add_tag").value;

  if (content === "") {
    alert("내용을 입력해주세요.");
  } else {
    if (selected_tag === "태그 추가") {
      // 태그 입력을 받아 글 작성
      if (add_tag === "") {
        alert("태그를 등록하거나 선택해주세요.");
      } else {
        // 태그 존재 여부 확인
        ref
          .collection("tags")
          .get()
          .then((querySnapshot) => {
            var flag = false;
            querySnapshot.forEach((doc) => {
              if (doc.data().tag === add_tag) {
                flag = true;
              }
            });
            if (flag === true) {
              alert("이미 존재하는 태그입니다.");
            } else {
              // 글 추가
              ref.collection("board").add({
                commentNum: 0,
                content: content,
                like: 0,
                tag: add_tag,
                time: firebase.firestore.Timestamp.fromDate(new Date()),
                userId: ui.currentUser.uid,
              });
              // 새로운 태그 추가
              ref
                .collection("tags")
                .add({
                  tag: add_tag,
                  time: firebase.firestore.Timestamp.fromDate(new Date()),
                })
                .then(function () {
                  window.location.href = "timeline.html";
                });
            }
          });
      }
    } else {
      // 태그를 선택하여 글 작성
      // 글 추가
      ref
        .collection("board")
        .add({
          commentNum: 0,
          content: content,
          like: 0,
          tag: selected_tag,
          time: firebase.firestore.Timestamp.fromDate(new Date()),
          userId: ui.currentUser.uid,
        })
        .then(function () {
          window.location.href = "timeline.html";
        });
    }
  }
}
