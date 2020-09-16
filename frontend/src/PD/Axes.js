import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Axes extends Component {

    constructor(props) {

        super(props)

        this.state = {

            weld_width: props.weldWidth,
            x_axis: []

        }

        this.offset = props.offset
        this.graph_width = props.graphWidth

    }

    
    componentDidUpdate(props) {

        if (this.graph_width !== props.graphWidth || this.state.weld_width !== props.weldWidth) {

            this.graph_width = props.graphWidth
            this.setState({weld_width: this.props.weldWidth}, this.xAxis)

        }

    }

    xAxis = () => {

        document.getElementById('x_axis').style.width = this.graph_width - this.offset.y - this.offset.margin + 'px'
        document.getElementById('feature_area').style.width = this.graph_width - this.offset.y - this.offset.margin + 'px'
        document.getElementById('plot_area').style.width = this.graph_width - this.offset.y - this.offset.margin + 'px'

        const w = Math.round(this.state.weld_width * 10) / 10
        const w1 = Math.round(this.state.weld_width / 2 * 10) / 10

        this.setState({x_axis: [
            <div key="x_0" style={{backgroundColor:'black', left:0, top: 0, width:1, height: 8}}></div>,
            <div key="x_0_1" style={{left:-2, top: 10}}>0</div>,
            <div key="x_1" style={{backgroundColor:'black', left: (this.graph_width - this.offset.y - this.offset.margin) / 2, top: 0, width:1, height: 10}}></div>,
            <div key="x_1_1" style={{left:(this.graph_width - this.offset.y - this.offset.margin) / 2 - (String(w1).length * 5 / 2), top: 10}}>{w1}</div>,
            <div key="x_n" style={{backgroundColor:'black', left:this.graph_width - this.offset.y - this.offset.margin, top: 0, width:1, height: 10}}></div>,
            <div key="x_n_1" style={{left:this.graph_width - this.offset.y - this.offset.margin - (String(w).length * 5 / 2), top: 10}}>{w}</div>
        ]})

    }

    render () {

        return (
            
            <div className="axes">
                
                <div style={{marginRight: 10}}>
                <div style={{backgroundColor:'black', top:this.offset.x + 7, left:this.offset.y - 21.5, height:360, width: 0.8}}></div>
                    {(() => {

                        let out = []

                        for (let i = 0; i <= 12; i += 1) {

                            out.push(
                                <div key={'y_axis_num_' + i} style={{top:i * 30 + this.offset.x, textAlign:'right', width: 20}}>
                                    {360 - i * 30}
                                </div>)
                            out.push(
                                <div key={'y_axis_notch_' + i} style={{backgroundColor: 'black', left:26, top:i * 30 + this.offset.x + 7 , height: 1, width: 8}}>
                                    
                                </div>
                            )

                        }

                        return out
                    })()}
                </div>

                <div id='feature_area'></div>
                <div id='plot_area'></div>

                <div id="x_axis" style={{backgroundColor:'black', height:0.8}}>
                    {this.state.x_axis}
                </div>

            </div>

        )
    
    }

}


Axes.propTypes = {

    graphWidth: PropTypes.number.isRequired,
    weldWidth: PropTypes.number.isRequired,
    offset: PropTypes.object.isRequired

}