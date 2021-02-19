import React, { Component } from "react"
import PropTypes from 'prop-types'
import { Col, InputGroup, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Toggle from 'react-bootstrap-toggle'
import fontawesome from '@fortawesome/fontawesome'
import { faLink, faFilter, faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import APIClient from './APIClient.js'

fontawesome.library.add(faLink, faFilter, faSpinner, faSearchPlus, faSearchMinus);


export default class Ctrl extends Component {

    constructor(props) {

        super(props)

        this.state = {

            confirm_on: false,
            features_filter: false,
            filter: {
                matched:true,
                unmatched: true
            },
            manually_checked: false,
            match_on: false,
            nav_status: props.nav_status,
            run_match: props.run_match,
            section_id: props.section_id,
            run_name: this.props.run_name,
            weld_side_a: true,
            sectionIndex: props.sectionIndex,
            sectionTotal: props.sectionTotal

        }


        this.first_match = 0
        this.second_match = 0
        
        this.apiClient = new APIClient()

    }

    componentDidUpdate(props) {
        
        if (this.state.section_id !== props.section_id ||
            this.state.manually_checked !== props.manually_checked ||
            this.state.match_on !== props.match_on ||
            this.state.confirm_on !== props.confirm_on ||
            this.state.nav_status !== props.nav_status ||
            this.state.sectionIndex !== props.sectionIndex ||
            this.state.sectionTotal !== props.sectionTotal ||
            this.state.run_name !== props.run_name)

            this.setState({

                confirm_on: props.confirm_on,
                manually_checked: props.manually_checked,
                match_on: props.match_on,
                nav_status: props.nav_status,
                run_match: props.run_match,
                run_name: props.run_name,
                section_id: props.section_id,
                sectionIndex: props.sectionIndex,
                sectionTotal: props.sectionTotal

            })

    }


    highligtDom = (id, color) => {

        const doc = document.getElementById(id)

        doc && (doc.style.backgroundColor = color)

    }

    renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          Simple tooltip
        </Tooltip>
    )


    styles = {
        main: {
            backgroundColor: "#fff",
            display: "flex",
            padding: "0px 10px 0px 10px",
            width: "100%",
            flexWrap: "wrap"
        },
        section1: {
            alignItems: "center",
            display: "flex",
            float: "left"
        },
        section2: {
            alignItems: "center",
            display: "flex",
            float: "left",
            flex: 1
        },
        run_name: {
            backgroundColor: "#eee",
            height: "40px",
            marginRight: "10px",
            alignItems: "center",
            display: "flex",
            float: "left",
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5,
            fontWeight: "bold"
        },
        icon: {
            backgroundColor: "#DDD",
            marginRight: "10px",
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5
        },
        divider:{
            borderRight: "1px solid #444",
            marginLeft: 0,
            marginRight: 25,
            height: 30
        },
        nav: {
            display: "flex",
            padding:10,
            whiteSpace: "nowrap",
            float: "left"
        },
        section_index: {
            color: "#888",
            padding: "0px 10px 0px 10px",
            alignSelf: "center"
        },
        completion: {
            padding:10,
            whiteSpace: "nowrap",
            width: "100%"
        },
        completion_toggle: {
            display: "flex",
            float: "right"
        },
        goto_toggle: {
            border: "1px solid lightgrey",
            left: "95px",
            position: "absolute"
        }
    }

    render = () => (
        <div style={this.styles.main}>
            <div style={this.styles.section1}>
                <div style={this.styles.run_name}>
                    {this.state.run_name}
                </div>
                <div style={this.styles.icon} title="Feature Filter">
                    <i className="fa fa-filter"></i>
                </div>
                <Form.Check
                    type="checkbox"
                    value="matched"
                    onChange={
                        () => this.setState({
                            filter: {
                                matched: !this.state.filter.matched,
                                unmatched: this.state.filter.unmatched
                            }
                        }, () => this.props.setMatchFilter(this.state.filter.matched, this.state.filter.unmatched))
                    }
                    checked={this.state.filter.matched} />
                <img
                    alt="Unmatched"
                    width={12}
                    height={12}
                    src={"../feature_icons/link.png"}
                />
                <div style={{width: "15px"}}></div>
                <Form.Check
                    type="checkbox"
                    value="unmatched"
                    onChange={
                        () => this.setState({
                            filter: {
                                matched: this.state.filter.matched,
                                unmatched: !this.state.filter.unmatched
                            }
                        }, () => this.props.setMatchFilter(this.state.filter.matched, this.state.filter.unmatched))
                    }
                    checked={this.state.filter.unmatched} />
                <img
                    alt="Unmatched"
                    width={12}
                    height={12}
                    src={"../feature_icons/unlink.png"}
                />
                <Form.Group as={Col} style={{marginBottom:0}}>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <img
                                    alt="Unmatched"
                                    width={22}
                                    height={22}
                                    src={"../feature_icons/metal_loss.png"}
                                />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            type="text"
                            placeholder="0"
                            style={{width:70}}
                            onBlur={e => {
                                if (!isNaN(e.target.value) && e.target.value !== "0")
                                    this.props.lossLimit(e.target.value)
                                else {
                                    this.props.lossLimit(null)
                                    e.target.value = ""
                                }
                            }}
                        />
                    </InputGroup>
                </Form.Group>
                <div style={this.styles.divider}></div>
                <div style={this.styles.icon} title="Feature Matching ON/OFF">
                    <i className="fa fa-link"></i>
                </div>
                <Toggle
                    active={this.state.match_on}
                    on="ON"
                    off="OFF"
                    onstyle="primary"
                    offstyle="default"
                    width={68}
                    height={38}
                    onClick={this.props.onMatch}
                />
                <div style={{display: this.state.confirm_on ? "block" : "none"}}>
                    <Button
                        variant="primary"
                        onClick={this.props.onConfirm}>Save</Button>{" "}
                    <Button
                        variant="secondary"
                        onClick={this.props.onCancel}>Cancel</Button>
                </div>
            </div>
            <div style={this.styles.section2}>
                <div style={this.styles.nav}>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 100 }}
                        rootClose={true}
                        overlay={props => (
                            <Tooltip id="button-tooltip" {...props}>
                                Previous Complete section
                            </Tooltip>
                        )}
                    >
                        <Button
                            disabled={this.state.nav_status.charAt(0) === "0"}
                            variant="outline-primary"
                            onClick={() => this.props.sectionGo(-1,true, this.state.features_filter)}
                        >
                            &lt;&lt;
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 100 }}
                        rootClose={true}
                        overlay={props => (
                            <Tooltip id="button-tooltip" {...props}>
                                Previous section
                            </Tooltip>
                        )}  
                    >
                        <Button
                            disabled={this.state.nav_status.charAt(1) === "0"}
                            variant="outline-primary"
                            onClick={() => this.props.sectionGo(-1,false, this.state.features_filter)}
                        >
                            &lt;
                        </Button>
                    </OverlayTrigger>
                    <div
                        style={this.styles.section_index}>
                        {this.state.sectionIndex + "/" + this.state.sectionTotal}
                    </div>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 100 }}
                        rootClose={true}
                        overlay={props => (
                            <Tooltip id="button-tooltip" {...props}>
                                Next section
                            </Tooltip>
                        )}
                    >
                        <Button
                            disabled={this.state.nav_status.charAt(2) === "0"}
                            variant="outline-primary"
                            onClick={() => this.props.sectionGo(1,false, this.state.features_filter)}
                        >
                            &gt;
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 100 }}
                        rootClose={true}
                        overlay={props => (
                            <Tooltip id="button-tooltip" {...props}>
                                Next Complete section
                            </Tooltip>
                        )}
                    >
                        <Button
                            disabled={this.state.nav_status.charAt(3) === "0"}
                            variant="outline-primary"
                            onClick={() => this.props.sectionGo(1,true, this.state.features_filter)}
                        >
                            &gt;&gt;
                        </Button>
                    </OverlayTrigger>
                    &nbsp;
                    <div className="feature_filter">
                        <div>Features</div>
                        <div>
                            <Toggle
                                active={this.state.features_filter}
                                style={{border: "1px solid lightgrey"}}
                                on="YES"
                                off="NO"
                                onstyle="default"
                                width={60}
                                height={38}
                                onClick={() => this.setState({features_filter: !this.state.features_filter})}
                            />
                        </div>
                    </div>
                    &nbsp;
                    <div style={{display: "inherit", position: "relative"}}>
                        <Form.Control
                            type="text"
                            placeholder="ID #"
                            onKeyPress={e => {
                                if (e.key === "Enter") {
                                    const param = escape("?weld_id=" + e.target.value + "&run_match=1")
                                    this.apiClient.callAPI({
                                        endpoint: "welds",
                                        data: param,
                                        callback: data => {
                                            data.forEach(weld => {
                                                if ((weld.side === "A" && this.state.weld_side_a) ||
                                                    (weld.side === "B" && !this.state.weld_side_a))
                                                        this.props.weldGo(weld.pipe_section_id)
                                            })
                                        }
                                    })

                                }
                            }}
                            style={{width: "100px"}}></Form.Control>
                        <Toggle
                            style={this.styles.goto_toggle}
                            active={this.state.weld_side_a}
                            id="match_toggle"
                            on="A"
                            off="B"
                            onstyle="side_a"
                            offstyle="side_b"
                            width={50}
                            height={38}
                            onClick={() => this.setState({weld_side_a: !this.state.weld_side_a})}
                        />
                    </div>
                </div>
                <div style={this.styles.completion}>
                    <Toggle
                        style={this.styles.completion_toggle}
                        active={this.state.manually_checked}
                        on="Complete"
                        off="Incomplete"
                        onstyle="success"
                        offstyle="danger"
                        width={120}
                        height={38}
                        onClick={this.props.manualCheck}
                    />
                </div>
            </div>

        </div>
    )

}
/*
<div style={{display:"flex', direction:'row', alignItems:"center", float:"right"}}>
                        <i className="fa fa-search-minus" style={{marginRight:'10px'}}></i>
                        <Form.Control type="text" placeholder="1" style={{width:'50px'}} />
                        <i className="fa fa-search-plus" style={{marginLeft:'10px'}}></i>
                    </div>*/

Ctrl.propTypes = {

    run_match: PropTypes.string.isRequired,
    section_id: PropTypes.string.isRequired,
    run_name: PropTypes.string.isRequired,
    sectionGo: PropTypes.func.isRequired,
    weldGo: PropTypes.func.isRequired,
    lossLimit: PropTypes.func.isRequired,
    manualCheck: PropTypes.func.isRequired,
    setMatchFilter: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onMatch: PropTypes.func.isRequired,
    manually_checked: PropTypes.bool.isRequired,
    confirm_on: PropTypes.bool.isRequired,
    match_on: PropTypes.bool.isRequired,
    nav_status: PropTypes.string.isRequired,
    sectionIndex: PropTypes.number.isRequired,
    sectionTotal: PropTypes.number.isRequired
}

