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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const form = document.querySelector('#JoinUsForm');

//버튼 누르면 실행
form.addEventListener('submit', (e) => {

    e.preventDefault();

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var password_check = document.getElementById("password_check");
    var p_name=document.getElementById("p_name").value;

    //조건 확인하기
    var email_ch = email.split("@")[1];
    if(email==""){
        document.test.Email.focus();
        alert("이메일을 입력해 주세요.");
    } else if (email_ch !== "ewhain.net") {
        document.test.Email.focus();
        alert("이화인 계정이어야 합니다.");
    } else if (password === "") {
        alert("비밀번호를 입력하세요");
    } else if (password.length < 6) {
        alert("비밀번호는 6자 이상이어야 합니다");
    } else if (password !== password_check.value) {
        document.test.p_check.focus();
        alert("비밀번호를 다시 확인해 주세요.");
    } else if(p_name==""){
        alert("이름을 모두 입력해 주세요.");
    }else {
        // 회원가입 성공 시 데이터 쓰기를 함.
        auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return db.collection('Users').doc(cred.user.uid).set({
                name: form.p_name.value,
            });
        }).then(() => {
            // 데이터 쓰기가 성공할 시 인증을 위한 이메일받음.
            let user = auth.currentUser;
            user.sendEmailVerification()
                .then(function () {
                    window.location.href = "intermission.html";
                });
        }).catch(function(error){
            alert(error.message);
        });
    }
});