var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', (req, res, next) => {
  res.setHeader('Set-Cookie', 'sessionid=123456')
  res.end()
})

router.get('/test1', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.json({ name: 'ayou' })
  res.end()
})


module.exports = router;
