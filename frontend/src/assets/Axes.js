import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Feature from './Feature.js'

export default class Axes extends Component {

    constructor(props) {

        super(props)

        this.state = {

            features: props.features,
            weld_width: props.weldWidth,
            x_axis: []

        }

        this.updateNum = this.props.updateNum

    }

    graphWidth = 0

    _isMounted = false


    componentWillUnmount() {

        this._isMounted = false

    }

    componentDidMount() {

        this._isMounted = true
        
        this.setArea()

        window.addEventListener('resize', this.setArea)

    }

    componentDidUpdate(props) {

        if (this.state.weld_width !== this.props.weldWidth)

            this.setState({weld_width: this.props.weldWidth}, this.xAxis)

        else if (this.updateNum !== this.props.updateNum) {
            
            this.updateNum = this.props.updateNum
            
            this.setState({features: this.props.features})

        }

    }
    

    setArea = () => {

        this.graphWidth = window.innerWidth - 95

        const px = this.graphWidth + 'px'

        document.getElementById('x_axis').style.width = px
        document.getElementById('feature_area').style.width = px
        document.getElementById('plot_area').style.width = px

        this._isMounted && this.xAxis()
        
    }

    xAxis = () => {

        const w = Math.round(this.state.weld_width * 10) / 10
        const w1 = Math.round(this.state.weld_width / 2 * 10) / 10


        const marks = Math.floor(this.graphWidth / 50)
        const width = this.graphWidth / marks

        let axis = []

        for (let i = 0; i <= marks; i += 1) {

            const val = Math.round(i * this.state.weld_width / marks * 100) / 100

            axis.push(

                <div
                    key={"x_" + i}
                    style={{...this.styles.xAxisNotch, left: width * i}}
                >
                </div>,
                <div
                    key={"x__" + i}
                    style={{...this.styles.xAxisNum, left: width * i - (String(val).length * 5 / 2)}}
                >
                    {val}
                </div>

            )

        }

        this.setState({x_axis: axis})

    }
    

    styles = {

        container: {

            backgroundColor: '#eee',
            margin: '0px 5px 40px 5px',
            height: '460px',
            padding: '0px 10px 0px 10px',
            position: 'relative'
              
        },

        plot: {

            color: 'black',
            fontSize: '0.7rem',
            height: '100%',
            paddingLeft: '30px',
            position: 'absolute'

        },

        yAxisContainer: {
            
            left: 0,
            marginRight: 10,
            marginTop: 6,
            position: 'absolute'
            
        },

        yAxisNotch: {
            
            position: 'absolute',
            backgroundColor: 'black',
            left: 26,
            height: 1,
            width: 8
    
        },

        yAxisNum: {

            position:'absolute',
            textAlign:'right',
            width: 20

        },

        yAxisRuler: {

            backgroundColor:'black',
            top: 37,
            left: 33,
            height:360,
            width: 0.8,
            position:'absolute'

        },

        featureArea: {

            backgroundColor: '#fafafa',
            top: '6px',
            left: '50px',
            height: '34px',
            position: 'absolute'

        },

        plotArea: {

            backgroundColor: '#fff',
            top: '43px',
            left: '50px',
            height: '361px',
            position: 'absolute'

        },

        xAxis: {
            
            backgroundColor:'black',
            height: 0.8,
            top: '425px',
            left: '50px',
            width: '500px',
            position:'absolute'
          
        },

        xAxisNotch: {
            
            backgroundColor:'black',
            left: 0,
            top: 0,
            width:1,
            height: 8,
            position:'absolute'

        },

        xAxisNum: {

            top: '10px',
            position: 'absolute'

        }

    }

    render = () => (

        <div style={this.styles.container}>
            <div style={this.styles.plot}>
                <div style={this.styles.yAxisContainer}>
                    <div style={this.styles.yAxisRuler}>
                    </div>
                    {(() => {
                        let out = []
                        for (let i = 0; i <= 12; i += 1) {
                            out.push(
                                <div
                                    key={'y_axis_num_' + i}
                                    style={{
                                        ...this.styles.yAxisNum,
                                        top: i * 30 + 30
                                    }}
                                >
                                    {360 - i * 30}
                                </div>
                            )
                            out.push(
                                <div
                                    key={'y_axis_notch_' + i}
                                    style={{
                                        ...this.styles.yAxisNotch,
                                        top: i * 30 + 37
                                    }}>
                                </div>
                            )
                        }
                        return out
                    })()}
                </div>
                <div
                    style={this.styles.featureArea}
                    id='feature_area'
                >
                </div>
                <div
                    style={this.styles.plotArea}
                    id='plot_area'
                >
                    {(this.state.features || []).map(feature => {
                        
                        const graph_width = this.graphWidth
                        const max_width = this.state.weld_width
                        const minSize = 0.5
                        const noDimFeatureSize = 2
                
                        const h = feature.width_in
                        const w = feature.length_in

                        if (!isNaN(h) && !isNaN(w)) {

                            feature.width = w > minSize ? graph_width / max_width * w / 12 : noDimFeatureSize
                            feature.height = h > minSize ? graph_width / max_width * h / 12 : noDimFeatureSize

                        }
                    
                        feature.left = graph_width / max_width * Number(feature.attributes.us_weld_dist_wc_ft)
//console.log(feature.matchMode)
                        return (
                            <Feature
                                key={'feature_' + feature.id}
                                feature={feature}
                                onClick={this.props.clickFeature}
                                onHover={this.props.hoverFeature}
                                matchMode={feature.matchMode}
                            />
                        )}
                    )}
                </div>
                <div
                    id="x_axis"
                    style={this.styles.xAxis}
                >
                    {this.state.x_axis}
                </div>
            </div>
        </div>
    )
    

}


Axes.propTypes = {

    features: PropTypes.array.isRequired,
    weldWidth: PropTypes.number.isRequired,
    updateNum: PropTypes.number.isRequired,
    clickFeature: PropTypes.func.isRequired,
    hoverFeature: PropTypes.func.isRequired

}
