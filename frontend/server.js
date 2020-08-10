const fetch = require("node-fetch");
const http = require('http');
const url = require('url')
const formidable = require('formidable');
const fs = require('fs');
const port = 3001
const { uploadPath } = require('./src/config')

const requestListener = function (req, res) {

  try {

    const uri = decodeURIComponent(url.parse(req.url,true).search.replace(/^\?/, ''))

    if (uri === 'upload') {

      const form = new formidable.IncomingForm({multiples:true});

      form.parse(req, function (err, fields, files) {

        for (let i = 0, ix = files.file.length; i < ix; i += 1) {

          const file = files.file[i]

          const oldpath = file.path
          const newpath = uploadPath + '/' + file.name

          fs.renameSync(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!')
                
          })
          
        }
        res.setHeader('Content-Type', 'application/json'),
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.writeHead(200);
        res.end();

      })
      
    } else {

      const temp = uri.split('&')
      
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
            console.log(data)
            res.end(data);
        })
    }

  } catch(e) {}

}

http.createServer(requestListener).listen(port)