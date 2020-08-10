import React, { Component } from 'react'
import { proxyURL, restURL } from '../config'

export default class DataAdapter extends Component {

    constructor(props) {

        super(props)
        this.state = {}

        this.spinner = document.getElementById('spinner')
        this.toast = document.getElementById('toast')

    }


    fetchRest = (rest, url, data, cbk) => {

        this.spin(true)

        fetch(url)
            .then(res => res.json())
            .then(res => {
                this.spin(false)
                cbk(this.adapt(rest, data, res), data)
            })
            .catch(e => {
                this.spin(false)
                console.log(e)
                this.toast.style.display = 'block'
            })

    }


    adapt = (rest, data, res) => {

        const points = {

            run_matches: () => {

                let options = []

                for (let i = 0, ix = res.length; i < ix; i += 1)
                
                    options.push(<option key={i} value={res[i].pipeline}>{res[i].id + ':' + res[i].run_a + '_' + res[i].run_a}</option>)

                return options
            },

            pipe_sections: () => {
                
                let options = []
        
                for (let i = 0, ix = (res || []).length; i < ix; i += 1)
        
                    options.push({key: res[i].id, label: res[i].section_id})
        
                return options

            },

            pipe_section: () => {

                let pipeSection = {

                        features: {},
                        table: [],
                        weld_a_width: 0,
                        weld_b_width: 0

                    },
                    temp = [],
                    featuresIn = []

                const pipe = res.features || []
                const pairs = res.feature_pairs || []
                const welds = res.welds || []
    
                pipe.forEach(p => {
        
                    let feature = {
        
                            attributes: {},
                            id: p.id,
                            feature_id: p.feature_id,
                            side: p.side,
                            matched: p.matched
        
                        }
        
                    p.attributes.map(a => feature.attributes[a.attribute_name] = a.attribute_data)
        
                    temp.push(feature)
        
                })
        
                welds.map(a => pipeSection['weld_'+ a.side.toLowerCase() + '_width'] = Number(a.us_weld_dist))
        
        
                for (let i = 0, ix = temp.length; i < ix; i +=1) {
                    
                    pipeSection.features[temp[i].id] = temp[i]
        
                    if (!~featuresIn.indexOf(temp[i].id))
                        
                        if (!temp[i].matched) {
        
                            featuresIn.push(temp[i].id)
                            pipeSection.table.push(temp[i].side === 'A' ? this.getTableRow(temp[i], null) : this.getTableRow(null, temp[i]))
        
                        } else {
        
                            for (let j = 0, jx = pairs.length; j < jx; j +=1) {
        
                                for (let k = 0, kx = temp.length; k < kx; k +=1) {

                                    if (!~featuresIn.indexOf(temp[i].id) && !~featuresIn.indexOf(temp[k].id))

                                        if (temp[i].side === 'A' && temp[i].id === pairs[j].feature_a &&
                                            temp[k].side === 'B' && temp[k].id === pairs[j].feature_b) {
                                        
                                            featuresIn.push(temp[i].id)
                                            featuresIn.push(temp[k].id)
                                                
                                            pipeSection.table.push(this.getTableRow(temp[i], temp[k]))
            
                                        } else if
                                            (temp[i].side === 'B' && temp[i].id === pairs[j].feature_b &&
                                             temp[k].side === 'A' && temp[k].id === pairs[j].feature_a) {
                                            
                                            featuresIn.push(temp[i].id)
                                            featuresIn.push(temp[k].id)
                                            pipeSection.table.push(this.getTableRow(temp[k], temp[i]))
            
                                        }
        
                                }
        
                            }
        
                        }
        
                }

                return pipeSection

            }

        }

        return (points[rest] && points[rest]()) || res

    }


    getTableRow = (a, b) => {

        const rnd = num => Number(num).toFixed(4)
        const side = (o, s) => {
            return {
                ['id_' + s]: (o && o.id) || false,
                ['feature_id_' + s]: (o && o.feature_id) || false,
                ['feature_' + s]: (o && o.attributes.feature) || false,
                ['feature_category_' + s]: (o && o.attributes.feature_category) || false,
                ['orientation_deg_' + s]: (o && rnd(o.attributes.orientation_deg)) || false,
                ['us_weld_dist_wc_ft_' + s]: (o && rnd(o.attributes.us_weld_dist_wc_ft)) || false,
                ['us_weld_dist_coord_m_' + s]: (o && rnd(o.attributes.us_weld_dist_coord_m)) || false,
                ['length_in_' + s]: (o && rnd(o.attributes.length_in)) || false,
                ['width_in_' + s]: (o && rnd(o.attributes.width_in)) || false,
                ['depth_in_' + s]: (o && rnd(o.attributes.depth_in)) || false,
            }
        }

        return{

            ...side(a, 'A'),
            _gutter:'',
            ...side(b, 'B'),

        }

    }

    get = (rest, data, cbk) => {

        const url = proxyURL +
            '?url=' +
            encodeURIComponent(restURL) +
            rest +
            (data ? '/' + data : '')

        this.fetchRest(rest, url, data, cbk)

    }


    post = (rest, data, cbk) => {
        
        const url = proxyURL +
            '?url=' +
            encodeURIComponent(restURL) +
            rest +
            '/' +
            '&data=' + JSON.stringify(data)

        this.fetchRest(rest, url, data, cbk)

    }


    upload = (data, cbk) => {

        this.spin(true)

        fetch(this.props.proxyURL + '?upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: data
        })
            .then(res => {
                this.spin(false)
                cbk(res)
            })
            .catch(e => {
                this.spin(false)
                console.log(e)
                this.toast.style.display = 'block'
            })
        
    }

    spin = s => this.spinner.style.display = s ? 'inline' : 'none'

}
