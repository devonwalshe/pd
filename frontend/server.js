const fetch = require("node-fetch")
const http = require('http')
const url = require('url')
const formidable = require('formidable')
const fs = require('fs')
const port = 3001
const { uploadPath } = require('./src/config')

const requestListener = function (req, res) {

  try {

    const uri = decodeURIComponent(url.parse(req.url,true).search.replace(/^\?/, ''))

    if (uri === 'upload') {

      const form = new formidable.IncomingForm({multiples:true});

      form.parse(req, function (err, fields, files) {

        for (let i = 0, ix = (files.file || []).length; i < ix; i += 1) {

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

            crossDomain:true
            
          }


      temp.forEach(t => {

        const kv = t.split('=')
        obj[kv[0]] = kv[1]

      })

      request.method = obj.method || 'GET'

      if (obj.data) {

        request.headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
        
        request.body = JSON.parse(JSON.stringify(obj.data))
      }

      fetch(decodeURIComponent(obj.url), request)
          .then(response => response.text())
          .then(data => {
            //console.log(data)
            obj.data && (request.method != 'GET') && res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Request-Method', '*')
            res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT')
            res.setHeader('Access-Control-Allow-Headers', '*')
            res.writeHead(200)
            res.end(data || JSON.stringify({}))
        })
    }

  } catch(e) {}

}

http.createServer(requestListener).listen(port)