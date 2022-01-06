const express = require('express')
const app = express()
const PORT = 8001
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const url = "https://kauth.kakao.com/oauth/authorize?client_id=" + process.env.REST_API_KEY + "&redirect_uri="+ redirectUrl + "&response_type=code";
  res.render("home", {
    kakao_login_url: url
  });
})
app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`)
})
// web.js
