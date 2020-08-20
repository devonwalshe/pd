import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Axes extends Component {

    constructor(props) {

        super(props)

        console.log(props)
        this.state = {

            weld_width: props.weldWidth,
            x_axis: []

        }

        this.y_offset = props.yOffset
        this.graph_width = props.graphWidth

    }

    
    componentDidUpdate(props) {

        if (this.graph_width !== props.graphWidth || this.state.weld_width !== props.weldWidth) {

            this.graph_width = props.graphWidth
            this.setState({weld_width: this.props.weldWidth}, this.xAxis)

        }

    }

    xAxis = () => {

       // console.log(this.graph_width, this.weld_width)

       document.getElementById('x_axis').style.width = this.graph_width - this.y_offset + 'px'
       document.getElementById('plot_area').style.width = this.graph_width - this.y_offset + 'px'
        //console.log(this.state.weld_width)

        const w = Math.round(this.state.weld_width * 100) / 100
        const w1 = Math.round(this.state.weld_width / 2 * 100) / 100

        this.setState({x_axis: [
            <div key="x_0" style={{backgroundColor:'black', left:0, top: 0, width:1, height: 10}}></div>,
            <div key="x_0_1" style={{left:-2, top: 10}}>0</div>,
            <div key="x_1" style={{backgroundColor:'black', left: (this.graph_width - this.y_offset) / 2, top: 0, width:1, height: 10}}></div>,
            <div key="x_1_1" style={{left:(this.graph_width - this.y_offset) / 2 - (String(w1).length * 5 / 2), top: 10}}>{w1}</div>,
            <div key="x_n" style={{backgroundColor:'black', left:this.graph_width - this.y_offset, top: 0, width:1, height: 10}}></div>,
            <div key="x_n_1" style={{left:this.graph_width - this.y_offset - (String(w).length * 5 / 2), top: 10}}>{w}</div>
        ]})

    }

    render () {

        const offsetTop = 30

        return (
            
            <div className="axes">
                <div style={{marginRight: 10}}>
                    {(() => {

                        let out = []

                        for (let i = 0; i <= 12; i += 1) {

                            out.push(<div key={'y_axis_' + i} style={{top:i * 30 + offsetTop}}>
                                <div style={{display:'table', textAlign:'right', width:35}}>
                                    <div style={{display:'table-cell', width:'50%'}}>{360 - i * 30}</div>
                                    <div style={{display:'table-cell', paddingLeft:2, width:'50%'}}>
                                        <div style={{backgroundColor: 'black', marginBottom:3, height: 1, width: 10}}></div>
                                    </div>
                                </div>
                            </div>)

                        }

                        return out
                    })()}
                </div>

                <div id="plot_area"></div>

                <div id="x_axis">
                    {this.state.x_axis}
                </div>

            </div>

        )
    
    }

}


Axes.propTypes = {

    graphWidth: PropTypes.number.isRequired,
    weldWidth: PropTypes.number.isRequired,
    yOffset: PropTypes.number.isRequired

}
