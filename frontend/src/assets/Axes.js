import React, { Component } from "react"
import PropTypes from "prop-types"
import Feature from "./Feature.js"

export default class Axes extends Component {

    constructor(props) {

        super(props)

        this.state = {

            keyLock: false,
            matchMode: false,
            x_axis: []

        }

        this.coords = {}

        this.bars = ["valve", "valve1", "valve2", "flange", "casing"]

        this.hoverDiv = {
            doc: null,
            id: 0,
            color: null
        }

        this.graphWidth = 0

    }

    
    
    componentDidMount() {
    
        this.setArea()

        window.addEventListener("resize", this.setArea)

    }

    componentDidUpdate() {

        if (this.state.weld_width !== this.props.weldWidth)

            this.setState({weld_width: this.props.weldWidth}, this.xAxis)

        if (this.updateNum !== this.props.updateNum) {

            this.updateNum = this.props.updateNum
            this.coords = {}

            this.setState({features: this.props.features})

        }

        if (this.state.keyLock !== this.props.keyLock)

            this.setState({
                
                keyLock: this.props.keyLock,
                matchMode: this.state.keyLock && !this.props.keyLock ? false : this.state.keyLock
            
            })

    }

    
    findFeature = (id, x, y) => {

        const co = this.coords
        const pad = 5

        for (let f in co) 

            if (f !== id) {
                    
                const fe = co[f]
                const l = fe.left - pad
                const t = fe.top - pad
                const w = fe.width + pad
                const h = fe.height + pad

                if (l <= x && t <= y && l + w >= x && t + h >= y)

                    return f

            }


    }


    generateFeatures = () => {

        let out = []

        this.coords = {}

        for (let f in this.props.features || {}) {
            
            const feature = this.props.features[f]
            
            const graph_width = this.graphWidth
            const max_width = this.props.weldWidth
            const minSize = 0.5
            const noDimFeatureSize = 2
            const minFeatSize = 18
            const minLossSize = 2
            const noWHFeatureSize = 28
            const noWHFeatureTop = -20
            const isBar = ~this.bars.indexOf(feature.attributes.feature_category) ? true : false

            const h = Number(feature.attributes.width_in)
            const w = Number(feature.attributes.length_in)

            let width,
                height,
                left,
                top,
                noDim

            if (!isNaN(h) && !isNaN(w)) {

                width = w > minSize ? graph_width / max_width * w / 12 : noDimFeatureSize
                height = h > minSize ? graph_width / max_width * h / 12 : noDimFeatureSize

            } 

            left = graph_width / max_width * Number(feature.attributes.us_weld_dist_wc_ft)
            left = isFinite(left) ? left : 0

            top = Number(feature.attributes.orientation_deg)
            top = 360 - (!isNaN(top) ? top : 360) || noWHFeatureTop

    
            if (height && width) {
    
                const min = feature.isLoss ? minLossSize : minFeatSize

                height = Math.max(height, min)
                width = Math.max(width, min)
                top = top - height / 2
                left = left - width / 2
                noDim = false
            
            } else {

                top = -34
                left -= noWHFeatureSize
                width = height = noWHFeatureSize
                noDim = true

            }


            if (isBar) {
                
                top = 0
                width = 3
                height = 360

            }

            this.coords[feature.id] = feature.pos = {
                left: left,
                top: top,
                height: height,
                width: width
            }

            feature.isBar = isBar
            feature.noDim = noDim

            out.push(
                <Feature
                    key={"feature_" + feature.id}
                    feature={feature}
                    onClick={id => {

                        this.state.keyLock && this.setState({matchMode: true})
                        this.props.clickFeature(id)

                    }}
                    onHover={this.props.hoverFeature}
                    onMouseMove={this.mouseMove}
                    onMouseUp={this.mouseUp}
                    keyLock={this.state.keyLock}
                    matchMode={this.state.matchMode}
                />
            )

        }

        return out

    }

    mouseMove = (id, x, y) => {

        this.state.matchMode || this.setState({matchMode: true})

        const f = this.findFeature(id, x, y)
        
        if (!f || this.hoverDiv.id !== f)

            this.resetHover()


        if (f && this.hoverDiv.id !== f) {

            const doc = document.getElementById(f)

            this.hoverDiv = {

                doc: doc,
                id: f,
                color: doc.style.backgroundColor

            }

            doc.style.border = "1px solid red"
            doc.style.zIndex = 2

        }

    }


    mouseUp = (id, x, y) => {

        const f = this.findFeature(id, x, y)
        
        f ? this.props.clickFeature(Number(f)) : this.props.cancelDrag()
    
        this.setState({matchMode: false})
        this.resetHover()

    }

    resetHover = () => {

        if (this.hoverDiv.id) {
                
            this.hoverDiv.doc.style.border = "1px solid transparent"
            this.hoverDiv.doc.style.zIndex = 1

        }

        this.hoverDiv.id = 0

    }

    setArea = () => {

        this.graphWidth = window.innerWidth - 95

        const px = this.graphWidth + "px"

        document.getElementById("x_axis").style.width = px
        document.getElementById("feature_area").style.width = px
        document.getElementById("plot_area").style.width = px

        //this._isMounted && 
        this.xAxis()
        
    }

    xAxis = () => {

        const marks = Math.floor(this.graphWidth / 50)
        const width = this.graphWidth / marks

        let axis = []


        const weldWidth = (Math.round(this.props.weldWidth * 100) / 100)
        const maxNotch = Math.round(weldWidth * 10 % 5) / 10

        // !console.log(weldWidth, maxNotch, Math.round((weldWidth - maxNotch) * 10) / 10)

        for (let i = 0; i <= marks; i += 1) {

            const val = Math.round(i * this.props.weldWidth / marks * 100) / 100

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
                                    key={"y_axis_num_" + i}
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
                                    key={"y_axis_notch_" + i}
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
                    id="feature_area"
                >
                </div>
                <div
                    style={this.styles.plotArea}
                    id="plot_area"
                >
                    {(() => this.generateFeatures())()}
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
    

    styles = {

        container: {

            backgroundColor: "#eee",
            margin: "0px 5px 40px 5px",
            height: "460px",
            padding: "0px 10px 0px 10px",
            position: "relative"
              
        },

        plot: {

            color: "black",
            fontSize: "0.7rem",
            height: "100%",
            paddingLeft: "30px",
            position: "absolute"

        },

        yAxisContainer: {
            
            left: 0,
            marginRight: 10,
            marginTop: 6,
            position: "absolute"
            
        },

        yAxisNotch: {
            
            position: "absolute",
            backgroundColor: "black",
            left: 26,
            height: 1,
            width: 8
    
        },

        yAxisNum: {

            position:"absolute",
            textAlign:"right",
            width: 20

        },

        yAxisRuler: {

            backgroundColor:"black",
            top: 37,
            left: 33,
            height:360,
            width: 0.8,
            position:"absolute"

        },

        featureArea: {

            backgroundColor: "#fafafa",
            top: "6px",
            left: "50px",
            height: "34px",
            position: "absolute"

        },

        plotArea: {

            backgroundColor: "#fff",
            top: "43px",
            left: "50px",
            height: "361px",
            position: "absolute"

        },

        xAxis: {
            
            backgroundColor:"black",
            height: 0.8,
            top: "425px",
            left: "50px",
            width: "500px",
            position:"absolute"
          
        },

        xAxisNotch: {
            
            backgroundColor:"black",
            left: 0,
            top: 0,
            width:1,
            height: 8,
            position:"absolute"

        },

        xAxisNum: {

            top: "10px",
            position: "absolute"

        }

    }


}


Axes.propTypes = {

    features: PropTypes.object.isRequired,
    weldWidth: PropTypes.number.isRequired,
    clickFeature: PropTypes.func.isRequired,
    hoverFeature: PropTypes.func.isRequired,
    cancelDrag: PropTypes.func.isRequired,
    keyLock: PropTypes.bool.isRequired

}
