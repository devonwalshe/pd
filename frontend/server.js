const fetch = require("node-fetch");
const http = require('http');
const url = require('url')
const port = 3001
const hurl = 'http://localhost:5000'

const requestListener = function (req, res) {
  try {
    
    const temp = decodeURIComponent(url.parse(req.url,true).search.replace(/^\?/, '')).split('&')

    let obj = {},
        request = {
          method: 'GET',
          crossDomain:true
        }


    temp.map(t => {

      const kv = t.split('=')
      obj[kv[0]] = kv[1]

    })

    if (obj.data) {
      request.method = 'POST'
      request.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      request.body = JSON.parse(JSON.stringify(obj.data))
    }

    fetch(decodeURIComponent(obj.url), request)
        .then(response => response.text())
        .then(data => {
          obj.data && res.setHeader('Content-Type', 'application/json'),
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Request-Method', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.writeHead(200);
          res.end(data);
      })
  } catch(e) {}
}

http.createServer(requestListener).listen(port)