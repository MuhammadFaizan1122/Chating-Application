 var currentUserKey = '';
 var chatKey = '';

 ///////////////////////////////////////////////////////

 function startChat(friendKey, friendName, friendPhoto) {
     var friendList = { friendId: friendKey, userId: currentUserKey }

     var db = firebase.database().ref('friend_list');
     var flag = false;
     db.on('value', function(friends) {
         friends.forEach(function(data) {
             var user = data.val();
             if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))) {
                 flag = true;
                 chatKey = data.key;
             }
         });
         if (flag === false) {
             chatKey = firebase.database().ref('friend_list').push(friendList, function(error) {
                 if (error) alert(error);
                 else {
                     document.getElementById("chatPanel").removeAttribute("style");
                     document.getElementById("startChat").setAttribute("style", "display:none;")
                     hideList();

                 }
             }).getKey();

         } else {
             document.getElementById("chatPanel").removeAttribute("style");
             document.getElementById("startChat").setAttribute("style", "display:none;")
             hideList();
         }


         ///////////////////////////////////////////////
         ////////Display Friend Name And Photo//////////
         document.getElementById('divChatName').innerHTML = friendName;
         document.getElementById('imgChat').src = friendPhoto;


         document.getElementById('massages').innerHTML = '';

         onKeyDown();

         //  document.getElementById('txtMassage').value = '';
         //  document.getElementById('txtMassage').focus();


         ///////////////////////////////////////////////
         ////////Display the chat masseges//////////
         LoadChatMessages(chatKey);
     });
 }


 LoadChatMessages = (chatKey, friendPhoto) => {
     var db = firebase.database().ref('chatMessages').child(chatKey);
     db.on('value', function(chats) {
         var massageDisplay = '';
         chats.forEach(function(data) {
             var chat = data.val();
             var dateTime = chat.dateTime.split(',');

             if (chat.userId !== currentUserKey) {
                 massageDisplay += `
                 <div class="row friendChat ">
                            <div class="col-2 col-sm-1 col-md-1 ">
                                <img src="${friendPhoto}" class="rounded-circle chat-pic ">
                            </div>
                            <div class="col-6 col-sm-7 col-md-7 ">
                                <p class="receive ">
                                ${chat.msg}
                                <span class="time" title="${dateTime[0]}">${dateTime[1]}</span>
                                </p>
                            </div>
                        </div>`;

             } else {
                 massageDisplay += `<div class="row myChat justify-content-end ">
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="send float-right">
                        ${chat.msg}
                        <span class="time" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${firebase.auth().currentUser.photoURL}" class="rounded-circle chat-pic">
                </div>
               </div>`
             }

         });
         document.getElementById("massages").innerHTML = massageDisplay;
         txtMassage.value = "";
         document.getElementById('massages').scrollTo(0, document.getElementById('massages').scrollHeight);
     });
 };

 function showList() {
     document.getElementById("side-1").classList.remove('d-none', 'd-md-block');
     document.getElementById("side-2").classList.add('d-none');
 }

 function hideList() {
     document.getElementById("side-1").classList.add('d-none', 'd-md-block');
     document.getElementById("side-2").classList.remove("d-none");
 }

 function onKeyDown() {
     document.addEventListener('keydown', function(key) {
         if (key.which === 13) {
             sendMassage();
         }
     })
 }

 function sendMassage() {
     var chatMessage = {
         userId: currentUserKey,
         msg: document.getElementById('txtMassage').value,
         dateTime: new Date().toLocaleString()
     };

     firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error) {
         if (error) alert(error);
         else {
             var massage = `<div class="row myChat justify-content-end ">
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="send float-right">
                                    ${document.getElementById('txtMassage').value}
                                    <span class="time ">7:22 pm</span>
                                </p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${firebase.auth().currentUser.photoURL}" class="rounded-circle chat-pic">
                            </div>
                           </div>`

             document.getElementById("massages").innerHTML += massage;
             txtMassage.value = "";
             document.getElementById('massages').scrollTo(0, document.getElementById('massages').scrollHeight);
         }
     });
 };
 console.log(firebase.database);


 LoadChatList = () => {
     var db = firebase.database().ref('friend_list');
     db.on('value', function(lists) {
         document.getElementById('lstChat').innerHTML = `
                                                        <li class="list-group-item input" style="background-color:#f8f8f8;">
                                                          <input type="text" placeholder="Search or new contact" class=" form-control form-rounded">
                                                        </li>`

         lists.forEach(function(data) {
             var lst = data.val();
             var friendKey = '';
             if (lst.friendId === currentUserKey) {
                 friendKey = lst.userId;
             } else if (lst.userId === currentUserKey) {
                 friendKey = lst.friendId;
             }
             firebase.database().ref('users').child(friendKey).on('value', function(data) {
                 var user = data.val();
                 document.getElementById('lstChat').innerHTML += `
                                                                    <li class="list-group-item list-group-item-action list " onclick="startChat('${data.key}','${user.name}','${user.photoURL}',)">
                                                                        <div class="row p-0">
                                                                            <div class="p-0 col-2 col-sm-2 col-md-3 col-lg-2 friendImage">
                                                                                <img src="${user.photoURL}" class="rounded-circle mr-2 ml-1 friend-pic text-center">
                                                                            </div>
                                                                            <div class="pl-2 col-10 col-sm-10 col-md-9 col-lg-10">
                                                                                <div class="name ">${user.name}</div>
                                                                                <div class="under-name ">This is some massege text...</div>
                                                                            </div>
                                                                        </div>
                                                                    </li>`;
             });
         });
     });
 }


 populateFriendList = () => {
     document.getElementById('lstFriend').innerHTML = `
            
            <div class="text-center">
                <span class="spinner-border text-warning mt-5" style="width: 5rem; height: 5rem; "></span>
            </div>`;



     var db = firebase.database().ref('users');
     var lst = '';
     db.on('value', function(users) {
         if (users.hasChildren()) {
             lst = `
                <li class="list-group-item input " style="background-color:#f8f8f8; ">
                    <input type="text " placeholder="Search or new contact " class=" form-control form-rounded ">
                </li>`;
         }
         users.forEach(function(data) {
             var user = data.val();
             if (user.email !== firebase.auth().currentUser.email) {
                 lst += `
            <li class="list-group-item list-group-item-action list" data-dismiss="modal" onclick="startChat('${data.key}', '${user.name}', '${user.photoURL}')">
            <div class="row p-0">
                <div class="p-0 col-md-2 friendImage">
                    <img src="${user.photoURL}" class="rounded-circle ml-1 friend-pic text-center">
                </div>
                <div class="pl-2 col-md-10">
                    <div class="name mt-2 ml-1">${user.name}</div>
                </div>
            </div>
        </li>
            `;
             }

         });
         document.getElementById('lstFriend').innerHTML = lst;
     });
 }

 signIn = () => {
     // var provider = new firebase.auth.FacebookAuthProvider();
     // firebase.auth().signInWithPopup(provider).then(function(result) {
     //     var user = result.user;
     //     console.log(user)
     // }).catch(function(error) {
     //     console.log(error.massage)
     // });
     // alert("You'r Sign In")
     ////////////////////////---Google Authentication---//////////////////////

     var provider = new firebase.auth.GoogleAuthProvider();
     firebase.auth().signInWithPopup(provider).then(function(result) {
         var user = result.user;
         console.log(user)

     }).catch(function(error) {
         console.log(error.massage)
     });
 }



 signOut = () => {
     firebase.auth().signOut();
 }




 onFirebaseStateChanged = () => {
     firebase.auth().onAuthStateChanged(onStateChanged);
 }
 onStateChanged = (user) => {
     if (user) {
         // alert(firebase.auth().currentUser.email + '\n ' + firebase.auth().currentUser.displayName);

         var userProfile = {
             email: '',
             name: '',
             photoURL: ''
         }

         userProfile.email = firebase.auth().currentUser.email;
         userProfile.name = firebase.auth().currentUser.displayName;
         userProfile.photoURL = firebase.auth().currentUser.photoURL;

         var db = firebase.database().ref('users');
         var flag = false;
         db.on('value', function(users) {
             users.forEach(function(data) {
                 var user = data.val();
                 if (user.email === userProfile.email) {
                     currentUserKey = data.key;
                     flag = true;

                 }
             });
             if (flag === false) {
                 firebase.database().ref('users').push(userProfile, callback);

             } else {
                 document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
                 document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;

                 document.getElementById('signInBtn').style = "display:none";
                 document.getElementById('signOutBtn').style = "";
             }

             LoadChatList();
         });

     } else {
         document.getElementById('imgProfile').src = 'https://maeruamall.com/wp-content/uploads/2015/04/person-placeholder-4.png';
         document.getElementById('imgProfile').title = '';


         document.getElementById('signInBtn').style = "";
         document.getElementById('signOutBtn').style = "display:none";


     }
 }

 callback = (error) => {
     if (error) {
         alert(error)
     } else {
         document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
         document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;

         document.getElementById('signInBtn').style = "display:none";
         document.getElementById('signOutBtn').style = "";
     }
 }

 /////////////////////////////
 //Call Auth state changed

 onFirebaseStateChanged();