var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', (req, res) => {
  res.setHeader('Etag', 'abc')
  res.end('get success')
})

router.put('/test', (req, res) => {
  res.end('put success')
})

router.post('/test', (req, res) => {
  res.end('post success')
})

module.exports = router;
