import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'
import DataAdapter from './DataAdapter'

export default class RawFile extends Component {

    constructor(props) {

        super(props)
        this.state = {
            current: 0,
            step: null,
            form: {}
        }


        this.dataAdapter = new DataAdapter({
            restError: () => this.setState({rest_error: true})
        })

    }


    componentDidMount = () => this.getStep()

    clickNext = () => {

        if (this.state.current === 0) {

            const file_a = document.getElementById('file_a').files[0]
            const file_b = document.getElementById('file_b').files[0]

            //if (!file_a || !file_b)

              //  return


            const data = new FormData() 
            data.append('file', file_a)
            data.append('file', file_b)

            this.dataAdapter.upload(data, () => this.setState({current: this.state.current + 1}, this.getStep))            

        } else if (this.state.current === 1) {

            
            console.log(this.state.form)

            this.setState({current: this.state.current + 1}, this.getStep)

        }

        

    }

    clickBack = () => {

        this.setState({current: this.state.current - 1}, this.getStep)

    }

    formChange = e => this.setState({form:{...this.state.form, [e.target.id]: e.target.value}})

    getStep = () => this.setState({step: this.steps[this.state.current]})

    steps = [
        (
            <tbody>
                <tr>
                    <td>Raw file side A:</td>
                    <td>
                        <Form.File 
                            id="file_a"
                            label="Side A file"
                            onChange={e => console.dir(e.target.labels[0].innerHTML=e.target.files[0].name)}
                            custom
                        />
                    </td>
                </tr>
                <tr>
                    <td>Raw file side B:</td>
                    <td>
                        <Form.File 
                            id="file_b"
                            label="Side B file"
                            onChange={e => console.dir(e.target.labels[0].innerHTML=e.target.files[0].name)}
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
                        <Form.Control as="select" id="feature_mapping" custom
                            onChange={this.formChange}>
                        
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
                            id="coordinates"
                            label=""
                            onClick={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>short joint threshold:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="short_joint_threshold"
                            label=""
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>short joint variance:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="short_joint_variance"
                            label=""
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>short joint lookahead:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="short_joint_lookahead"
                            label=""
                            onChange={this.formChange}
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
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>backtrack validation lookahead:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="backtrack_validation_lookahead"
                            label=""
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>feature match threshold:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="feature_match_threshold"
                            label=""
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
                <tr>
                    <td>metal loss match threshold:</td>
                    <td>
                        <Form.Control 
                            type="text"
                            id="metal_loss_match_threshold"
                            label=""
                            onChange={this.formChange}
                        />
                        
                    </td>
                </tr>
            </tbody>
        )

    ]

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
                    <Button onClick={this.clickNext}>{this.state.current === 2 ? 'Save' : 'Next'}</Button>
                </div>
            </Form>
                
            
        )

    }

}
