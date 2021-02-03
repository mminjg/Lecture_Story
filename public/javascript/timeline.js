var firebaseConfig = {
  apiKey: "AIzaSyBriqW5bb956O8Mi87iZJKtdNsD4uWGBp4",
  authDomain: "lecture-story.firebaseapp.com",
  databaseURL: "https://lecture-story.firebaseio.com",
  projectId: "lecture-story",
  storageBucket: "lecture-story.appspot.com",
  messagingSenderId: "109177070261",
  appId: "1:109177070261:web:8b6aa71008757f550254fc"
};
firebase.initializeApp(firebaseConfig);

const db=firebase.firestore();

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

// 초기 태그는 전체 태그로 설정, 최근 포스팅 가져오기
var docRef = db.collection(semester).doc(courseNO+"-"+prof).collection("board");
var tagName = "전체";
document.querySelector(".tag").style.fontWeight = "bold";   //"전체" 태그를 굵게
loadPostings(docRef);

// 2020_2학기가 아니면 연필 안보이게 하는 함수
function hidePencil(){
    var pencil = document.querySelector(".write");
    if(semester != "2020_2학기"){
        pencil.setAttribute("style", "visibility: hidden");
    }
    else{
        pencil.setAttribute("style", "visibility: visible")
    }
}

hidePencil();


// 게시글 클릭하면 해당 게시글과 댓글 확인하는 페이지로 이동하는 함수
function readPost(evt){
    // 해당 문서로 이동하기 위해 문서 id 저장
    localStorage.setItem("docID", evt.currentTarget.dataset.docid);
    // 해당 문서로 이동
    window.location.href="read_post.html";
}

// 태그 버튼 누르면 db의 해당 태그의 게시글들 로딩시키는 함수
function getTagPostings(evt){
    // 선택된 태그 값 가져오기
    tagName = evt.currentTarget.innerText;
    tagName = tagName.substring(1, tagName.length);

    // 타임라인에서 선택한 태그에만 진한 효과 주기
    var everyTag = document.querySelectorAll(".tag");
    for(var i=0; i<everyTag.length; i++){
        everyTag[i].style.fontWeight="normal";
    }
    evt.currentTarget.style.fontWeight = "bold";

    // 해당 태그에 해당하는 포스팅 로드
    docRef = db.collection(semester).doc(courseNO+"-"+prof).collection("board");
    loadPostings(docRef);
}

/* 포스팅 부분 변경 및 실시간 업데이트*/

// 포스팅들 띄울 html 공간
var postingZone = document.querySelector(".postings");

// 변화 감지해서 계속 포스팅 로드하는 함수
function loadPostings(docRef){
    //리스너 생성
    docRef
    .orderBy("time", "desc") //시간 내림차순
    .onSnapshot((docSnapshot) => {  //스냅샷
    postingZone.innerHTML = ""; //포스팅 뜨는 세션에 HTML 부분 적기
    //db에서 읽으면서 html 코드 추가
    docSnapshot.forEach((doc) => {
        if(doc.data().tag === tagName || tagName === "전체"){
            addPostHTML(doc);
        }

      // 각 게시글 누르면 해당 게시글로 이동하는 이벤트리스너 등록
        var tags = document.querySelectorAll(".post");
        var tagsNum = tags.length;
        for(var i=0; i< tagsNum; i++){
            tags[i].addEventListener("click", readPost);
        }
      
    });
    
    });
}

// db의 게시글 문서를 html로 띄워주는 함수
function addPostHTML(doc){
    // 게시글 담을 리스트
    var entry = document.createElement("li");

    // 게시글 하나가 차지하는 div
    var post = document.createElement("div");
    post.setAttribute("class","post");
    post.setAttribute("data-docid", doc.id);

    // 해쉬 태그
    var hashtag = document.createElement("p");
    hashtag.innerText= "# "+doc.data().tag;
    hashtag.setAttribute("class", "hashtag");

    // 게시글 내용
    var content = document.createElement("span");
    content.setAttribute("class","contents");
    content.innerText = doc.data().content;

    // 날짜+댓글 수 보이는 부분
    var date_com_like = document.createElement("div");

    // 날짜
    var date = document.createElement("p");
    date.setAttribute("class", "date");
    date.innerText= doc.data().time.toDate().toDateString();

    // 댓글 보이는 div
    var like_com = document.createElement("div");
    like_com.setAttribute("class","like-comment");

    // 댓글 아이콘과 댓글 수
    var comment = document.createElement("img");
    comment.setAttribute("src", "../imgs/comment.png");
    var commentNode = document.createTextNode(doc.data().commentNum);
    
    like_com.append(comment);
    like_com.append(commentNode);
    date.append(like_com);
    date_com_like.append(date);
    post.append(hashtag);
    post.append(content);
    post.append(date_com_like);
    entry.append(post);

    postingZone.appendChild(entry);
}

/* 타임 라인 변경 및 실시간 업데이트*/

// 타임라인 띄울 html 공간
const timelineZone = document.getElementById("timelineSec");

// 변화 감지해서 계속 타임라인 태그들 로드하는 함수
function loadTimelineTags(){
    var entry = document.createElement("li");

    var timelineRef = db.collection(semester).doc(courseNO+"-"+prof).collection("tags");
    //리스너 생성
    timelineRef
    .orderBy("time", "desc") //시간 내림차순
    .onSnapshot((docSnapshot) => {  //스냅샷
    timelineZone.innerHTML = ""; //타임라인 뜨는 세션에 HTML 부분 적기
    //db에서 읽으면서 html 코드 추가
    docSnapshot.forEach((doc) => {
        var entry = document.createElement("li");
    
        var point = document.createElement("div");
        point.setAttribute("class", "point");
    
        var button = document.createElement("button");
        button.setAttribute("class", "tag");
        var tagNode = document.createTextNode("#"+doc.data().tag);
        button.append(tagNode);
    
        entry.append(point);
        entry.append(button);
    
        timelineZone.appendChild(entry);
        
    });
        // 제일 마지막은 항상 개강 태그로 마무리
        var entry = document.createElement("li");
        entry.setAttribute("style", "padding-bottom:0; margin-bottom:0; vertical-align: bottom;");
    
        var point = document.createElement("div");
        point.setAttribute("class", "point");
        point.setAttribute("style", "width: 20px; height: 20px; left:-7px; background-color: #aaaaaa;");
    
        var button = document.createElement("button");
        button.setAttribute("class", "tag");
        var tagNode = document.createTextNode("#개강");
        button.append(tagNode);
    
        entry.append(point);
        entry.append(button);
    
        timelineZone.appendChild(entry);

        // 각 태그 누르면 해당 태그 포스팅 뜨는 이벤트 리스너 등록
        var tags = document.querySelectorAll(".tag");
        var tagsNum = tags.length;
        for(var i=0; i< tagsNum; i++){
            tags[i].addEventListener("click", getTagPostings);
        }
    
    });
}

// 페이지 로드 시 타임라인 초기값 로드
loadTimelineTags();

// 학기 select 박스에서 학기를 변경할 경우 작동하는 함수
function change_tag(){

    // html에서 학기 이름 따오기
    var tag_choice = document.querySelector(".semester");
    var tag_selected = tag_choice.options[tag_choice.selectedIndex].value
    tag_selected = tag_selected.replace("-", "_");

    // 학기 이름 저장하고 학기 이름 변경
    localStorage.setItem("semester", tag_selected);
    semester = localStorage.getItem("semester");
    hidePencil();

    // 바뀐 학기의 타임라인과 포스팅 기본값(최근) 로드
    docRef = db.collection(semester).doc(courseNO+"-"+prof).collection("board");
    timelineRef = db.collection(semester).doc(courseNO+"-"+prof).collection("tags");
    tagName="전체";
    loadPostings(docRef);
    loadTimelineTags();
    document.querySelector(".tag").style.fontWeight = "bold";   //"전체" 태그를 굵게
}

// 검색 기능
document.getElementById("search_box")
.addEventListener("submit", (e)=>{
    e.preventDefault();
    // 검색어 가져오기
    var search_key = document.getElementById("search").value;
    document.getElementById("search").value = "";
    // 검색 결과 보여줄 때는 전체 태그가 설정되어 있도록
    var everyTag = document.querySelectorAll(".tag");
    for(var i=0; i<everyTag.length; i++){
        everyTag[i].style.fontWeight="normal";
    }
    tagName="전체";
    document.querySelector(".tag").style.fontWeight = "bold";   //"전체" 태그를 굵게
    // 해당 검색어를 포함하는 현재 학기의 모든 포스팅 불러오기
    docRef
    .orderBy("time", "desc").get().then((querySnapshot) => {
        postingZone.innerHTML = ""; //포스팅 뜨는 세션에 HTML 부분 비우기
        querySnapshot.forEach((doc) => {
        if(doc.data().content.includes(search_key)){
            addPostHTML(doc);
        }
        });
         // 각 게시글 누르면 해당 게시글로 이동하는 이벤트리스너 등록
         var tags = document.querySelectorAll(".post");
         var tagsNum = tags.length;
         for(var i=0; i< tagsNum; i++){
             tags[i].addEventListener("click", readPost);
         }
    });
});

// 새로고침 할때마다 양식 다시 제출 확인 뜨는 오류 해결
if ( window.history.replaceState ) {
    window.history.replaceState( null, null, window.location.href );
}
