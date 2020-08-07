import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'

export default class Upload extends Component {

    constructor(props) {

        super(props)
        this.state = {
            current: 0,
            step: null
        }

    }


    componentDidMount = () => {
        this.getStep()}

    clickNext = () => {

        this.setState({current: this.state.current + 1}, this.getStep)

    }

    clickBack = () => {

        this.setState({current: this.state.current + 1}, this.getStep)

    }

    getStep = () => {

        const steps = [
            (
                <tbody>
                    <tr>
                        <td>Raw file side A:</td>
                        <td>
                            <Form.File 
                                id="file-a"
                                label="Side B file"
                                custom
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Raw file side B:</td>
                        <td>
                            <Form.File 
                                id="file-b"
                                label="Side A file"
                                custom
                            />
                        </td>
                    </tr>
                </tbody>
            ),
            (
                <tbody>
                    <tr>
                        <td>feature mapping:</td>
                        <td>
                            <Form.Control as="select" custom>
                            
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            </Form.Control>
                        </td>
                    </tr>
                    <tr>
                        <td>coordinates:</td>
                        <td>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>short joint threshold:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>short joint variance:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>short joint lookahead:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>short joint difference:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>backtrack validation lookahead:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>feature match threshold:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                    <tr>
                        <td>metal loss match threshold:</td>
                        <td>
                            <Form.Control 
                                type="text"
                                id="custom-switch"
                                label=""
                            />
                            
                        </td>
                    </tr>
                </tbody>
            )

        ]

        this.setState({step: steps[this.state.current]})

    }

    render() {

        return (

            <Form>
                <div className="upload">
                    <table>
                        
                        {this.state.step}
                        
                    </table>
                    <br></br>
                    {this.state.current === 2 ? (<Button onClick={this.clickBack}>Discard</Button>) : ''}
                    {this.state.current === 2 ? (' ') : ''}
                    <Button onClick={this.clickNext}>{this.state.current === 2 ? 'Next' : 'Save'}</Button>
                </div>
            </Form>
                
            
        )

    }

}
