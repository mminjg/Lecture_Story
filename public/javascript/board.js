var firebaseConfig = {
    apiKey: "AIzaSyBriqW5bb956O8Mi87iZJKtdNsD4uWGBp4",
    authDomain: "lecture-story.firebaseapp.com",
    databaseURL: "https://lecture-story.firebaseio.com",
    projectId: "lecture-story",
    storageBucket: "lecture-story.appspot.com",
    messagingSenderId: "109177070261",
    appId: "1:109177070261:web:8b6aa71008757f550254fc"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 로그아웃 함수
function logOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        window.location.href = "main.html";
    }).catch(function (error) {
        // An error happened.
    });
}

const auth = firebase.auth();
const db = firebase.firestore();
var ui = firebaseui.auth.AuthUI(firebase.auth());
const container = document.querySelector(".sections");
const tag = document.querySelector(".semester");

//과목명 검색
function register() {
    var search_key = document.getElementById("search").value;
    localStorage.setItem("storageName", search_key);
    localStorage.setItem("semester", semester);
}

// 학기 select 박스에서 학기를 변경할 경우 작동하는 함수
function change_tag() {

    // 선택된 학기 정보를 받아 html에서 학기 이름 따오기
    var tag_choice = document.querySelector(".semester");
    var tag_selected = tag_choice.options[tag_choice.selectedIndex].innerHTML.replace("-", "_");

    // 학기 이름 저장하고 학기 이름 변경
    localStorage.setItem("semester", tag_selected);
    semester = localStorage.getItem("semester");
    loadPage();
}

// 특정 과목의 게시판을 선택했을 때 선택한 과목의 정보를 localStorage에 저장 후 페이지 이동
function move(evt) {

    var text = evt.getElementsByTagName("span")[0].innerHTML;
    var textlist = text.split(' ');

    var courseName = textlist[0].split("(")[0];
    localStorage.setItem("courseName", courseName);
    var prof = textlist[2];
    localStorage.setItem("prof", textlist[2]);

    db.collection("Users")
        .doc(auth.currentUser.uid)
        .collection("즐겨찾기")
        .doc(courseName + "-" + prof)
        .get()
        .then(function (doc) {
            var courseNO = doc.data().학수번호;
            localStorage.setItem("courseNO", courseNO);
            var semester = doc.data().학기;
            localStorage.setItem("semester", semester);
        }).then(() => {
            window.location.href = "timeline.html";
        });
}

// db에서 특정 학기의 수업을 가져와 원하는 형식으로 보여주기. 
function loadPage() {
    let html = '<div class="contents-area"><h2>즐겨찾기한 목록</h2>';
    // db에서 원하는 정보를 얻어 문자열의 원하는 위치에 삽입하기
    db.collection("Users")
        .doc(auth.currentUser.uid)
        .collection("즐겨찾기")
        .where("학기", "==", localStorage.getItem("semester"))
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (subject) {
                const section = `
                <section onClick="move(this)" class="content">
                    <div class="title">
                        <h3 class="name"><span class="t">${subject.data().교과목명}(${subject.data().분반}) - ${subject.data().교수명} 교수님&nbsp&nbsp</span></h3>
                        <button class="delete-button" onClick="del_lec(event, this.id)" id="${subject.data().교과목명}-${subject.data().교수명}"></button>
                    </div>
                </section>`;
                html += section;
            });
            html += `</div>`;
            container.innerHTML = html; // html 문서로 쓰기
        });
}

// 즐겨찾기 해둔 과목 게시판 하나를 삭제하는 함수
function del_lec(event, doc_name) {
    event.stopPropagation();
    console.log(doc_name);
    db.collection("Users").doc(auth.currentUser.uid).collection("즐겨찾기").doc(doc_name).delete().then(
        function () {
            alert("삭제되었습니다.");
            loadPage();
        });
}

// 로그인이나 회원가입 후 User의 정보가 있을 때 모든 기능이 동작함.
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var emailVerified = user.emailVerified;
        if (emailVerified === false) {
            alert("Email이 아직 인증되지 않았습니다.");
        } else {
            change_tag();
        }
    }
});

// 안내 팝업창
var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

closeButton.addEventListener("click", function(){
    modal.style.display ="none";
    console.log("bb");
});

window.onload = function(){
    modal.style.display ="block";
}