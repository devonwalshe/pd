const fetch = require("node-fetch");
const http = require('http');
const url = require('url')
const port = 3001
const hurl = 'http://localhost:5000'

const requestListener = function (req, res) {
  try {
    
    const temp = decodeURIComponent(url.parse(req.url,true).search.replace(/^\?/, '')).split('&')

    let obj = {method:'GET'}

    for (let i = 0, ix = temp.length; i <ix; i += 1) {

      const kv = temp[i].split('=')
      obj[kv[0]] = kv[1]

    }

    console.log(obj)

    let request = {
      method: obj.method,
      crossDomain:true
    }

    if (obj.data)

    request.data = obj.data

    fetch(decodeURIComponent(obj.url), request)
        .then(response => response.text())
        .then(data => {
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