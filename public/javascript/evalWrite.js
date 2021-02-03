const firebaseConfig = {
    apiKey: "AIzaSyBriqW5bb956O8Mi87iZJKtdNsD4uWGBp4",
    authDomain: "lecture-story.firebaseapp.com",
    databaseURL: "https://lecture-story.firebaseio.com",
    projectId: "lecture-story",
    storageBucket: "lecture-story.appspot.com",
    messagingSenderId: "109177070261",
    appId: "1:109177070261:web:8b6aa71008757f550254fc"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var ui = firebase.auth();

// 로그아웃 함수
function logOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location.href="main.html";
    }).catch(function(error) {
        // An error happened.
    });
}

// 렉쳐정보 전달 받기
const courseNO=localStorage.getItem("courseNO");
const courseName=localStorage.getItem("courseName");
const prof=localStorage.getItem("prof");
var semester=localStorage.getItem("semester");

// 렉처 이름 띄우기
document.getElementById("subject").innerHTML=courseName+"-"+prof;

// 학기 select box의 디폴트 값을 현재 학기로 설정
var semester_value = semester.substring(0, 6);
var select_tag = document.getElementById(semester_value);
select_tag.setAttribute("selected", "selected");

// 등록 버튼 누르면 등록
function sub(evt){ 
    var ref = db.collection(semester).doc(courseNO+"-"+prof).collection("evaluation");
    var selected_tag = document.getElementById("select_tag").value;
    var content = document.getElementById("content").value;

    if(content === null) {
        alert("내용을 입력해주세요.");
    }
    else{
        ref.add({ 
            content: content,
            tag: selected_tag,
            time: firebase.firestore.Timestamp.fromDate(new Date()),
            //userId: ui.currentUser.uid
        }).then(function(){
            window.location.href="evaluation.html";
        });
    }
}


