//node js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const emoji = require("node-emoji");

//authenticating
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//omw js
const handleTime = require(__dirname + "/js/handleTime.js");
const updateChecked = require(__dirname + "/js/updateChecked.js");
const createDisplay = require(__dirname + "/js/createDisplay.js");

const app = express();

app.use(express.static("/home/hosting_users/jueunyeo/apps/jueunyeo_onmyway/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.set('views', __dirname + '/views');

//authenticating
app.use(session({
  secret: "omwsecretphisonphison",
  resave: false,
  saveUninitialized: false
}));

//authenticating
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-yeo:omw-2022@cluster0.ym4e6.mongodb.net/omwDB", {
  useNewUrlParser: true
});

const sessionSchema = new mongoose.Schema({
  createUser: String, //kakaoId
  hour: Number,
  minute: Number,
  startTime: Date,
  endTime: Date,
  zeroMessageTime: Date,
  firstMessageTime: Date,
  secondMessageTime: Date,
  thirdMessageTime: Date,
  forthMessageTime: Date,
  fifthMessageTime: Date,
  finalMessageTime: Date,
  zeroMessageFlag: Boolean,
  firstMessageFlag: Boolean,
  secondMessageFlag: Boolean,
  thirdMessageFlag: Boolean,
  forthMessageFlag: Boolean,
  fifthMessageFlag: Boolean,
  finalMessageFlag: Boolean,
  Depart: String,
  Transit: [String],
  Arrive: String,
  shareList: [{
    shareUsername: String,
    shareNickname: String,
    shareProfile: String,
    shareUuid: String
  }]
});

const userinfoSchema = new mongoose.Schema({
  username: String, //kakaoId
  accessToken: String,
  refreshToken: String,
  nickname: String,
  profile: String,
  uuid: String,
  urgentList: [{
    urgentUsername: String,
    urgentNickname: String,
    urgentProfile: String,
    urgentUuid: String
  }]
});

const userSchema = new mongoose.Schema({
  username: String, //kakaoId
  password: String
});

const errorSchema = new mongoose.Schema({
  errorDate: Date,
  errorContent: String
});

//authenticating
userSchema.plugin(passportLocalMongoose);

const Session = new mongoose.model("Session", sessionSchema);
const User = new mongoose.model("User", userSchema);
const Userinfo = new mongoose.model("Userinfo", userinfoSchema);
const Error = new mongoose.model("Error", errorSchema);

//authenticating
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const homeUrl = "http://onmyway.co.kr";
const redirectUrl = "http://onmyway.co.kr/oauth";
const restApiKey = "a62cbbe436fc36a4056dbeac2897b11d";
const sslOptions = {
  key: fs.readFileSync("/home/hosting_users/jueunyeo/apps/jueunyeo_onmyway/ssl/onmyway.co.kr_20220110DC394.key.pem"),
  cert: fs.readFileSync("/home/hosting_users/jueunyeo/apps/jueunyeo_onmyway/ssl/onmyway.co.kr_20220110DC394.crt.pem"),
  ca: fs.readFileSync("/home/hosting_users/jueunyeo/apps/jueunyeo_onmyway/ssl/onmyway.co.kr_20220110DC394.ca-bundle.pem")
}

////////////////////////////////////////////////////////////////////////////////

function sendMessageUrgentCreate (accessToken, userNickname, urgentUuid){
  let uuid = [];
  uuid.push(String(urgentUuid));
  const jsonUuid = JSON.stringify(uuid);

  const data = {
    "object_type": "text",
    "text": emoji.get("children_crossing") + " " + userNickname + "님의 비상연락처로 등록되셨습니다",
    "link": {
      "web_url": homeUrl,
      "mobile_web_url": homeUrl
    },
    "button_title": "가는중! 바로가기"
  };
  const jsonData = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }

  const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;

  const request = https.request(sendMessageUrl, options, function(response){
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
}

function sendMessageShareCreate (accessToken, username, userNickname, sessionId, shareList){
  let uuid = [];
  for (let i = 0; i < shareList.length; i++) {
    uuid.push(String(shareList[i].shareUuid));
  }
  const jsonUuid = JSON.stringify(uuid);

  const data = {
    "object_type": "text",
    "text": emoji.get("traffic_light") + " "+ userNickname + "님이 이동상황을 공유합니다 ",
    "link": {
      "web_url": homeUrl + "/session-shared/" + username + "/" + sessionId,
      "mobile_web_url": homeUrl + "/session-shared/" + username + "/" + sessionId
    },
    "button_title": "이동상황 보러가기"
  };
  const jsonData = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }
  const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;
  const request = https.request(sendMessageUrl, options, function(response){
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
}

function sendMessageZeroTime (accessToken, username, sessionId){
  const data = {
    "object_type": "text",
    "text": emoji.get("ballot_box_with_check") + " " + "도착시간이 경과되었습니다! 도착하셨다면, 도착완료를 눌러 세션을 종료시켜주세요",
    "link": {
      "web_url": homeUrl + "/session-shared/" + username + "/" + sessionId,
      "mobile_web_url": homeUrl + "/session-shared/" + username + "/" + sessionId
    },
    "button_title": "이동상황 보러가기"
  };
  const jsonData = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }

  const sendMessageUrl = "https://kapi.kakao.com/v2/api/talk/memo/default/send?template_object="+jsonData;

  const request = https.request(sendMessageUrl, options, function(response){
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
}

function sendMessageShare (minute, accessToken, username, userNickname, sessionId, shareList){
  let uuid = [];
  for (let i = 0; i < shareList.length; i++) {
    uuid.push(String(shareList[i].shareUuid));
  }
  const jsonUuid = JSON.stringify(uuid);

  const data = {
    "object_type": "text",
    "text": emoji.get("warning") + " " +userNickname + "님의 도착예정시간이 " + minute + "분 초과되었습니다",
    "link": {
      "web_url": homeUrl + "/session-shared/" + username + "/" + sessionId,
      "mobile_web_url": homeUrl + "/session-shared/" + username + "/" + sessionId
    },
    "button_title": "이동상황 보러가기"
  };
  const jsonData = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }
  const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;
  const request = https.request(sendMessageUrl, options, function(response){
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
}

function sendMessageShareAndUrgent (minute, accessToken, username, userNickname, sessionId, shareList, urgentList){
  const data = {
    "object_type": "text",
    "text": emoji.get("rotating_light") + " " + userNickname + "님의 도착예정시간이 " + minute + "분 초과되었습니다",
    "link": {
      "web_url": homeUrl + "/session-shared/" + username + "/" + sessionId,
      "mobile_web_url": homeUrl + "/session-shared/" + username + "/" + sessionId
    },
    "button_title": "이동상황 보러가기"
  };
  const jsonData = JSON.stringify(data);

  let uuid = [];
  for (let i = 0; i < shareList.length; i++) {
    uuid.push(String(shareList[i].shareUuid));
  }
  for (let i = 0; i < urgentList.length; i++){
    uuid.push(String(urgentList[i].urgentUuid));
  }
  const uuidSet = new Set(uuid);
  uuid = [...uuidSet];

  if(uuid.length > 5){
    let uuidFirst = [];
    let uuidSecond = [];
    for(let i = 0; i < 5; i++){
      uuidFirst.push(uuid[i]);
    }
    for(let i = 5; i < uuid.length; i++){
      uuidSecond.push(uuid[i]);
    }
    const jsonUuidFirst = JSON.stringify(uuidFirst);
    const jsonUuidSecond = JSON.stringify(uuidSecond);

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken
      }
    }
    const sendMessageUrlFirst = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuidFirst+"&template_object="+jsonData;
    const sendMessageUrlSecond = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuidSecond+"&template_object="+jsonData;

    const requestFirst = https.request(sendMessageUrlFirst, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    requestFirst.write(jsonData);
    requestFirst.end();

    const requestSecond = https.request(sendMessageUrlSecond, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    requestSecond.write(jsonData);
    requestSecond.end();
  } else{
    const jsonUuid = JSON.stringify(uuid);

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken
      }
    }
    const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;
    const request = https.request(sendMessageUrl, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    request.write(jsonData);
    request.end();
  }
}

function sendMessageFinal (accessToken, userNickname, shareList, urgentList){
  const data = {
    "object_type": "text",
    "text": emoji.get("sos") + " " + userNickname + "님의 도착시간이 1시간 초과되었습니다! 연락을 취해주시기 바랍니다!",
    "link": {
      "web_url": homeUrl,
      "mobile_web_url": homeUrl
    },
    "button_title": "가는중! 바로가기"
  };
  const jsonData = JSON.stringify(data);

  let uuid = [];
  for (let i = 0; i < shareList.length; i++) {
    uuid.push(String(shareList[i].shareUuid));
  }
  for (let i = 0; i < urgentList.length; i++){
    uuid.push(String(urgentList[i].urgentUuid));
  }
  const uuidSet = new Set(uuid);
  uuid = [...uuidSet];

  if(uuid.length > 5){
    let uuidFirst = [];
    let uuidSecond = [];
    for(let i = 0; i < 5; i++){
      uuidFirst.push(uuid[i]);
    }
    for(let i = 5; i < uuid.length; i++){
      uuidSecond.push(uuid[i]);
    }
    const jsonUuidFirst = JSON.stringify(uuidFirst);
    const jsonUuidSecond = JSON.stringify(uuidSecond);

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken
      }
    }
    const sendMessageUrlFirst = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuidFirst+"&template_object="+jsonData;
    const sendMessageUrlSecond = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuidSecond+"&template_object="+jsonData;

    const requestFirst = https.request(sendMessageUrlFirst, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    requestFirst.write(jsonData);
    requestFirst.end();

    const requestSecond = https.request(sendMessageUrlSecond, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    requestSecond.write(jsonData);
    requestSecond.end();
  } else{
    const jsonUuid = JSON.stringify(uuid);

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken
      }
    }
    const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;
    const request = https.request(sendMessageUrl, options, function(response){
      response.on("data", function(data){
        console.log(JSON.parse(data));
      });
    });

    request.write(jsonData);
    request.end();
  }
}

function sendMessageDone (accessToken, userNickname, shareList){
  let uuid = [];
  for (let i = 0; i < shareList.length; i++) {
    uuid.push(String(shareList[i].shareUuid));
  }
  const jsonUuid = JSON.stringify(uuid);

  const data = {
    "object_type": "text",
    "text": emoji.get("white_check_mark") + " " + userNickname + "님이 도착완료했습니다",
    "link": {
      "web_url": homeUrl,
      "mobile_web_url": homeUrl
    },
    "button_title": "가는중! 바로가기"
  };
  const jsonData = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }

  const sendMessageUrl = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send?receiver_uuids="+jsonUuid+"&template_object="+jsonData;
  const request = https.request(sendMessageUrl, options, function(response){
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
}

function zeroMessageCatcher(){
  Session.find({zeroMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.zeroMessageTime) >= 0){
          const username = s.createUser;
          const sessionId = s.id;
          //sendMessage to user
          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              sendMessageZeroTime (accessToken, username, sessionId);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            zeroMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function firstMessageCatcher(){
  Session.find({firstMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.firstMessageTime) >= 0){
          //sendMessage to friends
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              sendMessageShare (10, accessToken, username, userNickname, sessionId, shareList);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            firstMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function secondMessageCatcher(){
  Session.find({secondMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.secondMessageTime) >= 0){
          //sendMessage to friends
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              sendMessageShare (20, accessToken, username, userNickname, sessionId, shareList);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            secondMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function thirdMessageCatcher(){
  Session.find({thirdMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.thirdMessageTime) >= 0){
          //sendMessage to friends and urgent
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              const urgentList = u.urgentList;
              sendMessageShareAndUrgent (30, accessToken, username, userNickname, sessionId, shareList, urgentList);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            thirdMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function forthMessageCatcher(){
  Session.find({forthMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.forthMessageTime) >= 0){
          //sendMessage to friends and urgent
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              const urgentList = u.urgentList;
              sendMessageShareAndUrgent (40, accessToken, username, userNickname, sessionId, shareList, urgentList);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            forthMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function fifthMessageCatcher(){
  Session.find({fifthMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.fifthMessageTime) >= 0){
          //sendMessage to friends and urgent
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              const urgentList = u.urgentList;
              sendMessageShareAndUrgent (50, accessToken, username, userNickname, sessionId, shareList, urgentList);
            }
          });

          Session.updateOne({
            _id: String(s.id)
          }, {
            fifthMessageFlag: true
          }, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  });
}

function finalMessageCatcher(){
  Session.find({finalMessageFlag: false}, function(err, sessions){
    if(err){
      console.log(err);
    } else{
      let now = new Date();

      sessions.forEach(function(s){
        if((now - s.finalMessageTime) >= 0){
          //sendMessage to friends and urgent
          const username = s.createUser;
          const sessionId = s.id;
          const shareList = s.shareList;

          Userinfo.findOne({username: username}, function(err, u){
            if(err){
              console.log(err);
            } else{
              const accessToken = u.accessToken;
              const userNickname = u.nickname;
              const urgentList = u.urgentList;
              sendMessageFinal (accessToken, userNickname, shareList, urgentList);
            }
          });

          Session.findByIdAndRemove(s.id, function(err) {
            if (!err) {
              console.log("deleteItem Success " + s.id);
            }
          });
        }
      });
    }
  });
}

setInterval(zeroMessageCatcher, 5000);
setInterval(firstMessageCatcher, 5000);
setInterval(secondMessageCatcher, 5000);
setInterval(thirdMessageCatcher, 10000);
setInterval(forthMessageCatcher, 10000);
setInterval(fifthMessageCatcher, 10000);
setInterval(finalMessageCatcher, 10000);


////////////////////////////////////////////////////////////////////////////////


app.get("/oauth", function(req, res) {
  const authorizeCode = req.query.code;
  const tokenUrl = "https://kauth.kakao.com/oauth/token?Content-type=application/x-www-form-urlencoded&grant_type=authorization_code&client_id=" + restApiKey + "&code=" + authorizeCode;

  https.get(tokenUrl, function(response) {
    if(response.statusCode === 200){
      response.on("data", function(data) {
        const tokenInfo = JSON.parse(data);
        const accessToken = tokenInfo.access_token;
        const refreshToken = tokenInfo.refresh_token;

        const options = {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
        const getUserUrl = "https://kapi.kakao.com/v2/user/me";
        https.get(getUserUrl, options, function(response) {
          if(response.statusCode === 200){
            response.on("data", function(data) {
              const userInfo = JSON.parse(data);
              const userKakaoId = String(userInfo.id);
              const userNickname = userInfo.kakao_account.profile.nickname;
              const userProfileImage = userInfo.kakao_account.profile.thumbnail_image_url;

              Userinfo.findOne({username: userKakaoId}, function(err, u){
                if(err){
                  console.log(err);
                  res.redirect("/");
                } else{
                  if(u === null){
                    //new user
                    const userinfo = new Userinfo({
                      username: userKakaoId, //kakaoId
                      accessToken: accessToken,
                      refreshToken: refreshToken,
                      nickname: userNickname,
                      profile: userProfileImage
                    });
                    userinfo.save();
                    res.redirect("/authen/" + userKakaoId);
                  } else {
                    //existing user
                    Userinfo.updateOne({username: userKakaoId}, {
                      accessToken: accessToken,
                      refreshToken: refreshToken,
                      nickname: userNickname,
                      profile: userProfileImage
                    }, function(err){
                      if(err){
                        console.log(err);
                        res.redirect("/");
                      }
                    });
                    res.redirect("/authen/" + userKakaoId);
                  }
                }
              });
            });
          } else{
            console.log(response.statusCode);
            res.redirect("/");
          }
        });
      });
    }else{
      console.log(response.statusCode);
      res.redirect("/");
    }
  });
});

app.get("/authen/:username", function(req, res){
  const getUsername = req.params.username;

  Userinfo.findOne({username: String(getUsername)}, function(err, u){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(u === null){
        res.redirect("/");
      } else{
        const getNickname = u.nickname;
        const getProfile = u.profile;
        res.render("authen", {
          bodyUsername: getUsername,
          bodyUserNickname: getNickname,
          bodyUserProfile: getProfile
        });
      }
    }
  });
});

app.post("/authen/:username", function(req, res){
  const getUsername = req.params.username;

  User.findOne({username: String(getUsername)}, function(err, u){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(u === null){
        //register
        User.register({username: req.body.username}, req.body.password, function(err, user){
          if(err){
            console.log(err);
            res.redirect("/");
          } else{
            passport.authenticate("local")(req, res, function(){
              res.redirect("/");
            });
          }
        });
      } else{
        //login
        const user = new User({
          username: req.body.username,
          password: req.body.password
        });
        req.login(user, function(err){
          if(err){
            console.log(err);
            res.redirect("/");
          } else{
            passport.authenticate("local")(req, res, function(){
              res.redirect("/");
            });
          }
        });
      }
    }
  });
});

app.post("/authen-delete/:username", function(req, res){
  const getUsername = req.params.username;
  User.findOneAndRemove({username: getUsername}, function(err){
    if(!err){
      console.log("deleteUser Success");
    }
  });
  res.redirect("/");
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/unlink", function(req, res){
  if(req.isAuthenticated()){
    const getUsername = req.user.username;
    Userinfo.findOne({username: String(getUsername)}, function(err, u){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        if(u === null) {
          res.redirect("/");
        } else{
          const getNickname = u.nickname;
          const getProfile = u.profile;
          res.render("unlink", {
            bodyUsername: getUsername,
            bodyUserNickname: getNickname,
            bodyUserProfile: getProfile
          });
        }
      }
    });
  } else{
    res.redirect("/");
  }
});

app.post("/unlink/:username", function(req, res){
  const getUsername = req.params.username;
  Userinfo.findOne({username: String(getUsername)}, function(err, u){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(u === null){
        res.redirect("/");
      } else{
        const accessToken = u.accessToken;
        const options = {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
        const unlinkUrl = "https://kapi.kakao.com/v1/user/unlink";
        https.get(unlinkUrl, options, function(response){
          response.on("data", function(data){
            if(response.statusCode === 200){
              const unlinkData = JSON.parse(data);
              User.findOneAndRemove({username: getUsername}, function(err){
                if(!err){
                  console.log("deleteUser Success " + getUsername);
                }
              });
              Userinfo.findOneAndRemove({username: getUsername}, function(err){
                if(!err){
                  console.log("deleteUserinfo Success " + getUsername);
                }
              });
              res.redirect("/");
            } else{
              console.log(response.statusCode);
              res.redirect("/");
            }
          });
        });
      }
    }
  });
});


////////////////////////////////////////////////////////////////////////////////


app.get("/session-list/:username", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;
    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        if(user === null){
          res.redirect("/");
        } else{
          const userNickname = user.nickname;
          const userProfile = user.profile;

          let sessionListViews = [];
          let createAble = 0;
          Session.find({createUser: String(getUsername)}, function(err, sessions){
            if(err){
              console.log(err);
              res.redirect("/");
            } else{
              sessions.forEach(function(s) {
                let sessionListView = {
                  id: s.id,
                  hour: s.hour,
                  minute: s.minute,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  Depart: s.Depart,
                  Transit: s.Transit,
                  Arrive: s.Arrive,
                  isRemain: handleTime.isRemain(s.endTime),
                  hourRemainedOver: handleTime.hourRemainedOver(s.endTime),
                  minuteRemainedOver: handleTime.minuteRemainedOver(s.endTime),
                  progressPercentage: handleTime.progressIntoPercentage(s.startTime, s.endTime),
                  progressColor: handleTime.progressColor(s.startTime, s.endTime)
                };
                sessionListViews.push(sessionListView);
              });
              createAble = createDisplay.createDisplay(sessionListViews.length);
              res.render("session-list", {
                bodyUsername: getUsername,
                bodyUserProfile: userProfile,
                bodyUserNickname: userNickname,
                sessionItems: sessionListViews,
                createDisplay: createAble
              });
            }
          });
        }
      }
    });
  } else{
    res.redirect("/");
  }
});

app.get("/session-create/:username", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;

    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        if(user === null){
          res.redirect("/");
        } else{
          const userProfile = user.profile;
          const userNickname = user.nickname;

          res.render("session-create", {
            bodyUsername: getUsername,
            bodyUserProfile: userProfile,
            bodyUserNickname: userNickname
          });
        }
      }
    });
  }else{
    res.redirect("/");
  }
});

app.post("/session-create/:username", function(req, res){
  const getUsername = req.params.username;

  Session.find({createUser: String(getUsername)}, function(err, sessions){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(sessions.length < 5){
        //if user has 0~4 sessions
        const selectedHour = Number(req.body.hourSelect);
        const selectedMinute = Number(req.body.minuteSelect);
        const selectedDepart = req.body.departBtnRadio;
        const selectedTransit = req.body.transitCheck;
        const selectedArrive = req.body.arriveBtnRadio;

        let start = new Date();
        let end = handleTime.getEndTime(selectedHour, selectedMinute);
        let firstMessage = handleTime.getFirstMessageTime(selectedHour, selectedMinute);
        let secondMessage = handleTime.getSecondMessageTime(selectedHour, selectedMinute);
        let thirdMessage = handleTime.getThirdMessageTime(selectedHour, selectedMinute);
        let forthMessage = handleTime.getForthMessageTime(selectedHour, selectedMinute);
        let fifthMessage = handleTime.getFifthMessageTime(selectedHour, selectedMinute);
        let finalMessage = handleTime.getFinalMessageTime(selectedHour, selectedMinute);

        const session = new Session({
          createUser: getUsername,
          hour: selectedHour,
          minute: selectedMinute,
          startTime: start,
          endTime: end,
          zeroMessageTime: end,
          firstMessageTime: firstMessage,
          secondMessageTime: secondMessage,
          thirdMessageTime: thirdMessage,
          forthMessageTime: forthMessage,
          fifthMessageTime: fifthMessage,
          finalMessageTime: finalMessage,
          zeroMessageFlag: false,
          firstMessageFlag: false,
          secondMessageFlag: false,
          thirdMessageFlag: false,
          forthMessageFlag: false,
          fifthMessageFlag: false,
          finalMessageFlag: false,
          Depart: selectedDepart,
          Transit: selectedTransit,
          Arrive: selectedArrive
        });
        session.save();
        res.redirect("/");
      } else{
        console.log("cannot create session 6! " + getUsername);
        res.redirect("/");
      }
    }
  });
});

app.get("/session-update/:username/:sessionId", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;
    const sessionId = req.params.sessionId;

    Userinfo.findOne({username: String(getUsername)}, function(err, u){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        if(u === null){
          res.redirect("/");
        } else{
          const userNickname = u.nickname;
          const userProfile = u.profile;

          Session.findById(sessionId, function(err, s){
            if(err){
              console.log(err);
              res.redirect("/");
            } else{
              let sessionUpdateView = {
                id: s.id,
                hour: s.hour,
                minute: s.minute,
                startTime: s.startTime,
                endTime: s.endTime,
                Depart: s.Depart,
                Transit: s.Transit,
                Arrive: s.Arrive,
                isRemain: handleTime.isRemain(s.endTime),
                hourRemainedOver: handleTime.hourRemainedOver(s.endTime),
                minuteRemainedOver: handleTime.minuteRemainedOver(s.endTime),
                progressPercentage: handleTime.progressIntoPercentage(s.startTime, s.endTime),
                progressColor: handleTime.progressColor(s.startTime, s.endTime),
                hourSelected: updateChecked.hourSelected(s.endTime),
                minuteSelected: updateChecked.minuteSelected(s.endTime),
                departChecked: updateChecked.departChecked(s.Depart),
                transitChecked: updateChecked.transitChecked(s.Transit),
                arriveChecked: updateChecked.arriveChecked(s.Arrive)
              };
              res.render("session-update", {
                bodyUsername: getUsername,
                bodyUserProfile: userProfile,
                bodyUserNickname: userNickname,
                session: sessionUpdateView
              });
            }
          });
        }
      }
    });
  }else{
    res.redirect("/");
  }
});

app.post("/session-update/:username/:sessionId", function(req, res){
  const getUsername = req.params.username;
  const sessionId = req.params.sessionId;

  const selectedHour = Number(req.body.hourSelect);
  const selectedMinute = Number(req.body.minuteSelect);
  const selectedDepart = req.body.departBtnRadio;
  const selectedTransit = req.body.transitCheck;
  const selectedArrive = req.body.arriveBtnRadio;

  let start = new Date();
  let end = handleTime.getEndTime(selectedHour, selectedMinute);
  let firstMessage = handleTime.getFirstMessageTime(selectedHour, selectedMinute);
  let secondMessage = handleTime.getSecondMessageTime(selectedHour, selectedMinute);
  let thirdMessage = handleTime.getThirdMessageTime(selectedHour, selectedMinute);
  let forthMessage = handleTime.getForthMessageTime(selectedHour, selectedMinute);
  let fifthMessage = handleTime.getFifthMessageTime(selectedHour, selectedMinute);
  let finalMessage = handleTime.getFinalMessageTime(selectedHour, selectedMinute);

  Session.updateOne({
    _id: String(sessionId)
  }, {
    hour: selectedHour,
    minute: selectedMinute,
    startTime: start,
    endTime: end,
    zeroMessageTime: end,
    firstMessageTime: firstMessage,
    secondMessageTime: secondMessage,
    thirdMessageTime: thirdMessage,
    forthMessageTime: forthMessage,
    fifthMessageTime: fifthMessage,
    finalMessageTime: finalMessage,
    zeroMessageFlag: false,
    firstMessageFlag: false,
    secondMessageFlag: false,
    thirdMessageFlag: false,
    forthMessageFlag: false,
    fifthMessageFlag: false,
    finalMessageFlag: false,
    Depart: selectedDepart,
    Transit: selectedTransit,
    Arrive: selectedArrive
  }, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
  });
  res.redirect("/");
});

app.get("/session-shared/:username/:sessionId", function(req, res){
  const getUsername = req.params.username;
  const sessionId = req.params.sessionId;

  Userinfo.findOne({username: String(getUsername)}, function(err, u){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(u === null){
        res.redirect("/");
      } else{
        const userNickname = u.nickname;
        const userProfile = u.profile;

        Session.findById(sessionId, function(err, s){
          if(err){
            console.log(err);
            res.redirect("/");
          } else{
            if(s === null){
              res.render("session-shared-no");
            } else{
              let sessionSharedView = {
                id: s.id,
                hour: s.hour,
                minute: s.minute,
                startTime: s.startTime,
                endTime: s.endTime,
                Depart: s.Depart,
                Transit: s.Transit,
                Arrive: s.Arrive,
                isRemain: handleTime.isRemain(s.endTime),
                hourRemainedOver: handleTime.hourRemainedOver(s.endTime),
                minuteRemainedOver: handleTime.minuteRemainedOver(s.endTime),
                progressPercentage: handleTime.progressIntoPercentage(s.startTime, s.endTime),
                progressColor: handleTime.progressColor(s.startTime, s.endTime)
              };
              res.render("session-shared", {
                bodyUserProfile: userProfile,
                bodyUserNickname: userNickname,
                session: sessionSharedView
              });
            }
          }
        });
      }
    }
  });
});

app.post("/session-delete/:username/:sessionId", function(req, res) {
  const getUsername = req.params.username;
  const sessionId = req.params.sessionId;

  Session.findByIdAndRemove(sessionId, function(err) {
    if (!err) {
      console.log("deleteItem Success" + sessionId);
    }
  });
  res.redirect("/");
});

app.post("/session-done/:username/:sessionId", function(req, res){
  const getUsername = req.params.username;
  const sessionId = req.params.sessionId;

  Userinfo.findOne({username: String(getUsername)}, function(err, u){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      if(u === null){
        res.redirect("/");
      } else{
        const accessToken = u.accessToken;
        const userNickname = u.nickname;
        Session.findById(sessionId, function(err, s){
          if(err){
            console.log(err);
            const now = new Date();
            const error = new Error({
              errorDate: now,
              errorContent: "Error at: app.post.session-done " + String(err)
            });
            error.save();
            res.redirect("/");
          } else{
            if(s.shareList.length > 0){
              sendMessageDone (accessToken, userNickname, s.shareList);
            }
          }
        });
        Session.findByIdAndRemove(sessionId, function(err) {
          if (!err) {
            console.log("Arrive!" + sessionId);
          }
        });
        res.redirect("/");
      }
    }
  });
});

app.get("/urgent-list/:username", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;

    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        if(user === null) {
          res.redirect("/");
        } else{
          const userNickname = user.nickname;
          const userProfile = user.profile;
          const userUrgentList = user.urgentList;
          const createAble = createDisplay.createDisplay(user.urgentList.length);

          res.render("urgent-list", {
            bodyUsername: getUsername,
            bodyUserProfile: userProfile,
            bodyUserNickname: userNickname,
            urgentItems: userUrgentList,
            createDisplay: createAble
          });
        }
      }
    });
  } else{
    res.redirect("/");
  }
});

app.get("/friend-list-urgent/:username", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;

    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        const accessToken = user.accessToken;
        const options = {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
        const getFriendUrl = "https://kapi.kakao.com/v1/api/talk/friends?limit=100";
        https.get(getFriendUrl, options, function(response){
          if(response.statusCode === 200){
            response.on("data", function(data){
              const friendData = JSON.parse(data);
              const friends = friendData.elements;

              let friendlistViews = [];
              friends.forEach(function(f){
                let friendView = {
                  username: f.id,
                  nickname: f.profile_nickname,
                  profile: f.profile_thumbnail_image
                };
                friendlistViews.push(friendView);
              });
              res.render("friend-list-urgent", {
                bodyUsername: getUsername,
                friendItems: friendlistViews
              });
            });
          } else{
            console.log(response.statusCode);
            res.redirect("/");
          }
        });
      }
    });
  } else{
    res.redirect("/");
  }
});

app.post("/urgent-list-create/:username", function(req, res){
  const getUsername = req.params.username;
  const friendname = req.body.selectFriend;

  if(friendname == undefined) {
    res.redirect("/urgent-list/" + getUsername);
  } else{
    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        const accessToken = user.accessToken;
        const userNickname = user.nickname;
        const oldFriendList = user.urgentList;
        const isFriend = oldFriendList.filter(function(f){
          return f.urgentUsername === String(friendname);
        });
        if (isFriend.length === 0 && oldFriendList.length < 5){
          //new urgent friend
          const options = {
            headers: {
              Authorization: "Bearer " + accessToken
            }
          }
          const getFriendUrl = "https://kapi.kakao.com/v1/api/talk/friends?limit=100";
          https.get(getFriendUrl, options, function(response){
            if(response.statusCode === 200){
              response.on("data", function(data){
                const friendData = JSON.parse(data);
                const friends = friendData.elements;
                const friend = friends.filter(function(f){
                  return f.id === Number(friendname);
                });
                //send message to new urgent friend
                sendMessageUrgentCreate (accessToken, userNickname, String(friend[0].uuid));

                const newFriend = {
                  urgentUsername: String(friend[0].id),
                  urgentNickname: String(friend[0].profile_nickname),
                  urgentProfile: String(friend[0].profile_thumbnail_image),
                  urgentUuid: String(friend[0].uuid)
                };
                oldFriendList.push(newFriend);

                //save new urgent friend
                Userinfo.updateOne({username: String(getUsername)}, {
                  urgentList: oldFriendList
                }, function(err){
                  if(err){
                    console.log(err);
                  }
                });
                res.redirect("/urgent-list/" + getUsername);
              });
            } else{
              console.log(response.statusCode);
              res.redirect("/");
            }
          });
        }else{
          //existing urgent friend
          res.redirect("/urgent-list/" + getUsername);
        }
      }
    });
  }
});

app.post("/urgent-list-delete/:username/:urgentFriendname", function(req, res){
  const getUsername = req.params.username;
  const urgentFriendname = req.params.urgentFriendname;

  Userinfo.findOne({username: String(getUsername)}, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/");
    } else{
      const currentUrgentList = user.urgentList;
      const newUrgentList = currentUrgentList.filter(function(f){
        return f.urgentUsername !== String(urgentFriendname);
      });
      Userinfo.updateOne({username: String(getUsername)}, {
        urgentList: newUrgentList
      }, function(err){
        if(err){
          console.log(err);
        }
      });
      res.redirect("/urgent-list/" + getUsername);
    }
  });
});

app.get("/share-list/:username/:sessionId", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;
    const sessionId = req.params.sessionId;

    Userinfo.findOne({username: String(getUsername)}, function(err, u){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        const userNickname = u.nickname;
        const userProfile = u.profile;

        Session.findById(sessionId, function(err, s){
          if(err){
            console.log(err);
            res.redirect("/");
          } else{
            let sessionView = {
              isRemain: handleTime.isRemain(s.endTime),
              hourRemainedOver: handleTime.hourRemainedOver(s.endTime),
              minuteRemainedOver: handleTime.minuteRemainedOver(s.endTime),
              progressPercentage: handleTime.progressIntoPercentage(s.startTime, s.endTime),
              progressColor: handleTime.progressColor(s.startTime, s.endTime)
            };

            let shareList = s.shareList;
            res.render("share-list", {
              bodyUsername: getUsername,
              bodyUserProfile: userProfile,
              bodyUserNickname: userNickname,
              bodySessionId: sessionId,
              shareItems: shareList,
              sessionItem: sessionView
            });
          }
        });
      }
    });
  } else{
    res.redirect("/");
  }
});

app.get("/friend-list-share/:username/:sessionId", function(req, res){
  if(req.isAuthenticated() && String(req.params.username) === String(req.user.username)){
    const getUsername = req.params.username;
    const sessionId = req.params.sessionId;

    Userinfo.findOne({username: String(getUsername)}, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/");
      } else{
        const accessToken = user.accessToken;
        const options = {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
        const getFriendUrl = "https://kapi.kakao.com/v1/api/talk/friends?limit=100";
        https.get(getFriendUrl, options, function(response){
          if(response.statusCode === 200){
            response.on("data", function(data){
              const friendData = JSON.parse(data);
              const friends = friendData.elements;

              let friendlistViews = [];
              friends.forEach(function(f){
                let friendView = {
                  username: f.id,
                  nickname: f.profile_nickname,
                  profile: f.profile_thumbnail_image
                };
                friendlistViews.push(friendView);
              });

              res.render("friend-list-share", {
                bodyUsername: getUsername,
                bodySessionId: sessionId,
                friendItems: friendlistViews
              });
            });
          } else{
            console.log(response.statusCode);
            res.redirect("/");
          }
        });
      }
    });
  } else{
    res.redirect("/");
  }
});

app.post("/share-list-update/:username/:sessionId", function(req, res){
  const getUsername = req.params.username;
  const sessionId = req.params.sessionId;
  const friendnames = req.body.selectFriend;

  if(friendnames == undefined){
    //no friend selected
    const newShareList = [];
    Session.updateOne({
      _id: String(sessionId)
    }, {
      shareList: newShareList
    }, function(err) {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/share-list/" + getUsername + "/" + sessionId);
  } else {
    if(typeof(friendnames) == "string"){
      //one friend selected
      Userinfo.findOne({username: getUsername}, function(err, u){
        if(err){
          console.log(err);
          res.redirect("/");
        } else{
          const accessToken = u.accessToken;
          const userNickname = u.nickname;
          const options = {
            headers: {
              Authorization: "Bearer " + accessToken
            }
          }
          const getFriendUrl = "https://kapi.kakao.com/v1/api/talk/friends?limit=100";
          https.get(getFriendUrl, options, function(response){
            if(response.statusCode === 200){
              response.on("data", function(data){
                const friendData = JSON.parse(data);
                const friends = friendData.elements;
                const friend = friends.filter(function(f){
                  return f.id === Number(friendnames);
                });

                let newShareList = [];
                const newFriend = {
                  shareUsername: String(friend[0].id),
                  shareNickname: String(friend[0].profile_nickname),
                  shareProfile: String(friend[0].profile_thumbnail_image),
                  shareUuid: String(friend[0].uuid)
                };
                newShareList.push(newFriend);
                Session.updateOne({
                  _id: String(sessionId)
                }, {
                  shareList: newShareList
                }, function(err) {
                  if (err) {
                    console.log(err);
                  }
                });
                //send message
                sendMessageShareCreate (accessToken, getUsername, userNickname, sessionId, newShareList);
                res.redirect("/share-list/" + getUsername + "/" + sessionId);
              });
            } else{
              console.log(response.statusCode);
              redirect("/");
            }
          });
        }
      });
    } else{
      //multiple friends selected
      Userinfo.findOne({username: getUsername}, function(err, u){
        if(err){
          console.log(err);
          const now = new Date();
          const error = new Error({
            errorDate: now,
            errorContent: "Error at: app.post.share-list-update " + String(err)
          });
          error.save();
          res.redirect("/");
        } else{
          const accessToken = u.accessToken;
          const userNickname = u.nickname;
          const options = {
            headers: {
              Authorization: "Bearer " + accessToken
            }
          }
          const getFriendUrl = "https://kapi.kakao.com/v1/api/talk/friends?limit=100";
          https.get(getFriendUrl, options, function(response){
            if(response.statusCode === 200){
              response.on("data", function(data){
                const friendData = JSON.parse(data);

                let newShareList = [];
                for(let i = 0; i < friendnames.length; i++){
                  let friends = friendData.elements;
                  let friend = friends.filter(function(f){
                    return f.id === Number(friendnames[i]);
                  });
                  let newFriend = {
                    shareUsername: String(friend[0].id),
                    shareNickname: String(friend[0].profile_nickname),
                    shareProfile: String(friend[0].profile_thumbnail_image),
                    shareUuid: String(friend[0].uuid)
                  };
                  newShareList.push(newFriend);
                }
                Session.updateOne({
                  _id: String(sessionId)
                }, {
                  shareList: newShareList
                }, function(err) {
                  if (err) {
                    console.log(err);
                  }
                });
                //send message
                sendMessageShareCreate (accessToken, getUsername, userNickname, sessionId, newShareList);
                res.redirect("/share-list/" + getUsername + "/" + sessionId);
              });
            } else{
              console.log(response.statusCode);
              redirect("/");
            }
          });
        }
      });
    }
  }
});

app.get("/OMWteam", function(req, res){
  res.render("omw-team-info");
});

app.get("/OMWprivacyPolicy", function(req, res){
  res.render("omw-privacy-policy");
});

app.get("/", function(req, res) {
  if(req.isAuthenticated()){
    const getUsername = req.user.username;

    Userinfo.findOne({username: getUsername}, function(err, u){
      if(err){
        console.log("err");
      } else{
        const accessToken = u.accessToken;
        const options = {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
        const getPermissionListUrl = "https://kapi.kakao.com/v2/user/scopes";
        https.get(getPermissionListUrl, options, function(response){
          if(response.statusCode === 200){
            response.on("data", function(data){
              const permissionListData = JSON.parse(data);
              const permissionList = permissionListData.scopes;

              let permissionNeeded = false;
              if (permissionList.length > 2){
                for (let i = 0; i < permissionList.length; i++){
                  if(permissionList[i].id === "friends" || permissionList[i].id === "talk_message"){
                    if(permissionList[i].agreed === false){
                      permissionNeeded = true;
                    }
                  }
                }
              } else{
                permissionNeeded = true;
              }
              if(permissionNeeded === true){
                const permissionUrl = "https://kauth.kakao.com/oauth/authorize?client_id="+restApiKey+"&redirect_uri=" + redirectUrl+ "&response_type=code&scope=friends,talk_message";
                res.redirect(permissionUrl);
              } else{
                res.redirect("/session-list/" + req.user.username);
              }
            });
          } else{
            console.log(response.statusCode);
            const oauthUrl = "https://kauth.kakao.com/oauth/authorize?client_id=" + restApiKey + "&redirect_uri="+ redirectUrl + "&response_type=code";
            res.render("home", {
              kakao_login_url: oauthUrl
            });
          }
        });
      }
    });
  } else{
    const oauthUrl = "https://kauth.kakao.com/oauth/authorize?client_id=" + restApiKey + "&redirect_uri="+ redirectUrl + "&response_type=code";
    res.render("home", {
      kakao_login_url: oauthUrl
    });
  }
});

https.createServer(sslOptions, function(){
  console.log("Server is running on port 8001");
}).listen(8001);
/*
app.listen(8001, function() {
  console.log("Server is running on port 8001");
});
*/
