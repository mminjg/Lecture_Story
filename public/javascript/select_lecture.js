// Your web app's Firebase configuration
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
    window.location.href = "login.html";
  }).catch(function (error) {
    // An error happened.
  });
}

//과목명 검색
function register(){
  var search_key=document.getElementById("search").value;
  localStorage.setItem("storageName",search_key);
}


//검색어:--- 표시하는 부분
var storageKey=localStorage.getItem("storageName");
document.getElementById("search_key").innerHTML=storageKey;

//board에서 학기 전달 받음
var semester = localStorage.getItem("semester");

//전달받은 학기로 option의 select를 바꿔둔다
if (semester === "2020_2학기") {
  document.getElementsByTagName('option')[0].selected = "selected";
} else if (semester === "2020_1학기") {
  document.getElementsByTagName('option')[1].selected = "selected";
} else if (semester === "2019_2학기") {
  document.getElementsByTagName('option')[2].selected = "selected";
} else if (semester === "2019_1학기") {
  document.getElementsByTagName('option')[3].selected = "selected";
} 

//데이터베이스
var db = firebase.firestore();
var auth=firebase.auth();

//처음에 과목리스트 불러오기
window.onload=show_lec();


// 학기 select 박스에서 학기를 변경할 경우, 자동으로 과목 리스트 변경
function change_tag(){
  // html에서 학기 이름 따오기
  var tag_choice = document.querySelector(".semester");
  var tag_selected = tag_choice.options[tag_choice.selectedIndex].value
  tag_selected = tag_selected.replace("-", "_");
   
  // 학기 이름 저장하고 학기 이름 변경
  localStorage.setItem("semester", tag_selected);
  semester = localStorage.getItem("semester");

  $('ul').empty(); //과목리스트 새로 가져오기 전, 이전 것은 지우기
  window.onload=show_lec(); //새로 불러오기
}


//검색어 읽어오기
//"이산"만 검색해도 "이산수학"이 검색되도록 했음
function show_lec() {
  //과목명에 영어가 포함되는 경우 전부 대문자이므로 toUpperCase()사용
  var upper_storageKey=storageKey.toUpperCase();
  var ref = db.collection(semester);
  ref.get().then(function (querySnapshot) {
    var arr = new Array;
    querySnapshot.forEach((doc) => {
      if(doc.data().교과목명.includes(upper_storageKey)){
        arr.push(doc.id);
      createLine(doc); //과목리스트 생성
      }
    });
  }).catch(function (error) {
    console.log(error);
  });
 
}

//checkbox 파트 만들기
function createLine(doc){
  var num=doc.data().학수번호;
  var name=doc.data().교과목명;
  var pf=doc.data().교수명;
  var cl=doc.data().분반;

  //html에 내용 동적으로 추가
  //라벨을 사용해서 체크박스 옆의 텍스트만 선택해도 과목 선택이 되도록 함
  var str=name+" ("+num+" - "+cl+") - "+pf+" 교수님<br>";
  line="<li><input type='checkbox' id='"+str+"'>"+
  "<label for='"+str+"'><span '>"+str+"</span></label></li>";
  $("ul").append(line); //jquery문법, html head에 링크 추가

};


//즐겨찾기 선택한 과목의 정보 데이터베이스에 추가
function sendInfo(){
  var rei=document.getElementsByTagName("input");
  var s=document.getElementsByTagName("span");
  var check_decision=false;
  //s -> span 태그 list => 0번은 검색어 나타내는 부분
  //그 뒤로 체크박스 옆에 과목명,학수번호,분반,교수님 나오는 문자열
  for(i=0;i<rei.length;i++){
    if(rei[i].checked===true){
      //rei -> 0번에는 검색창, 그뒤로는 체크박스버튼
      check_decision=true;//버튼이 체크 되어있으면
      splitStr(s[i].innerHTML); //문자열 쪼개기
    }
  }
  //아무 선택도 하지 않으면 팝업창 보내기
  if(check_decision===false){
    alert("과목을 선택하세요.");
  }
}

//radio 옆의 span 문자열을 쪼개기 + 정보 넘겨주기
function splitStr(str) {

  //사용자가 선택한 과목의 정보를 넘겨주기 위함
  var strArr = str.split(' ');
  var lec_name = strArr[0]; //강의명
  var lec_num = strArr[1].split("(")[1];//학수번호
  var lec_class = strArr[3].split(")")[0];//분반
  var lec_pf = strArr[5];//교수님

  //즐겨찾기 데이터베이스에 추가
  var docdoc = db.collection("Users").doc(firebase.auth().currentUser.uid).collection("즐겨찾기");
  docdoc.doc(lec_name + "-" + lec_pf).set({
    교과목명: lec_name,
    교수명: lec_pf,
    분반: lec_class,
    학수번호: lec_num,
    학기: semester
  }).then(function () {
    //즐겨찾기에 문서가 저장이 되면
    //board.html로 화면 전환
    window.location.href = "board.html";
  });
}