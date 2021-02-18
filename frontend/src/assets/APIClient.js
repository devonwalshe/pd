import { Component } from 'react'
import { restURL } from '../config'


export default class APIClient extends Component {

    constructor(props) {

        super(props)

        this.state = {
            rest_error: false
        }

    }

    callAPI = (request) => {

        const method = request.method || 'get'

        let url,
            req = {method: method}

        if (~(['put', 'post', 'delete', 'upload']).indexOf(method)) {

            url = restURL + request.endpoint + '/' +  (request.id ? request.id : '')

            if (method === 'post' && request.data)

                req.body = JSON.stringify(request.data)

            else if (~(['put', 'upload']).indexOf(method))

                req.body = request.data

            req.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

            if (method === 'upload') {

                req.method = 'post'

                req.headers = {
                    'Accept': 'application/json'
                }
            }

        } else

            url = restURL + request.endpoint + (request.data ? '/' + escape(request.data) : '')

        this.spin(true)

        fetch(url, req)

            .then(res => (~(['get', 'put', 'post']).indexOf(method) && res.json()))

            .then(res => {

                this.spin(false)

                request.callback(res, request)

            })

            .catch(e => {

                console.log(e)
                this.spin(false)

                document.getElementById('toast').style.display = 'block'
                
            })
    
    }

    spin = display => {

        const spinner = document.getElementById('spinner')

        spinner && (spinner.style.display = display ? 'inline' : 'none')

    }

}
