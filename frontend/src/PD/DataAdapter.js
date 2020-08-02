import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class DataAdapter extends Component {

    constructor(props) {

        super(props)
        this.state = {}

    }


    fetchRest = (rest, url, data, cbk) => {

        this.props.isLoading(true)

        fetch(url)
            .then(res => res.json())
            .then(res => {
                this.props.isLoading(false)
                cbk(this.adapt(rest, data, res), data)
            })
            .catch(e => {
                this.props.isLoading(false)
                this.props.restError(e)
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
    
                for (let i = 0, ix = pipe.length; i < ix; i += 1) {
        
                    let feature = {
        
                            attributes: {feature_id: pipe[i].feature_id},
                            id: pipe[i].id,
                            side: pipe[i].side,
                            matched: pipe[i].matched,
                            left: 0,
                            top: 0
        
                        }
        
                    for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {
        
                        const { attribute_data, attribute_name } = pipe[i].attributes[j]
        
                        feature.attributes[attribute_name] = attribute_data
        
                        if (attribute_name === 'us_weld_dist_wc_ft')
                        
                            feature.left = Number(attribute_data)
                        
                        else if (attribute_name === 'orientation_deg') {
        
                            let top = Number(attribute_data)
                            feature.top = !isNaN(top) ? top : 360
        
                        }
        
                    }
        
                    temp.push(feature)
        
                }
        
                welds.map(a => pipeSection['weld_'+ a.side.toLowerCase() + '_width'] = Number(a.us_weld_dist))
        
        
                for (let i = 0, ix = temp.length; i < ix; i +=1) {
                    
                    pipeSection.features[temp[i].id] = temp[i]
        
                    if (!~featuresIn.indexOf(temp[i].id))
                        
                        if (!temp[i].matched) {
        
                            featuresIn.push(temp[i].id)
                            pipeSection.table.push(temp[i].side === 'A' ? {
                                _gutter:'',
                                id_A: temp[i].id,
                                feature_A: temp[i].attributes.feature_category,
                                id_B: false,
                                feature_B: false
                            } : {
                                _gutter:'',
                                id_A: false,
                                feature_A: false,
                                id_B: temp[i].id,
                                feature_B: temp[i].attributes.feature_category
                            })
        
                        } else {
        
                            for (let j = 0, jx = pairs.length; j < jx; j +=1) {
        
                                for (let k = 0, kx = temp.length; k < kx; k +=1) {

                                    if (temp[i].side === 'A' && temp[i].id === pairs[j].feature_a &&
                                        temp[k].side === 'B' && temp[k].id === pairs[j].feature_b) {
                                    
                                            featuresIn.push(temp[i].id)
                                    featuresIn.push(temp[k].id)
                                            
                                        pipeSection.table.push({
                                            _gutter:'',
                                            id_A: temp[i].id,
                                            feature_A: temp[i].attributes.feature_category,
                                            id_B: temp[k].id,
                                            feature_B: temp[k].attributes.feature_category
                                        })
        
                                    } else if (temp[i].side === 'B' && temp[i].id === pairs[j].feature_b &&
                                        temp[k].side === 'A' && temp[k].id === pairs[j].feature_a) {
                                        
                                            featuresIn.push(temp[i].id)
                                    featuresIn.push(temp[k].id)
                                        pipeSection.table.push({
                                            _gutter:'',
                                            id_A: temp[k].id,
                                            feature_A: temp[k].attributes.feature_category,
                                            id_B: temp[i].id,
                                            feature_B: temp[i].attributes.feature_category
                                        })
        
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

    get = (rest, data, cbk) => {

        const url = this.props.proxyURL +
            '?url=' +
            encodeURIComponent(this.props.restURL) +
            rest +
            (data ? '/' + data : '')

        this.fetchRest(rest, url, data, cbk)

    }


    post = (rest, data, cbk) => {
        
        const url = this.props.proxyURL +
            '?url=' +
            encodeURIComponent(this.props.restURL) +
            rest +
            '/' +
            '&method=POST' +
            '&data=' + JSON.stringify(data)

        this.fetchRest(rest, url, data, cbk)

    }


}



DataAdapter.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired,
    isLoading: PropTypes.func.isRequired,
    restError: PropTypes.func.isRequired

}
