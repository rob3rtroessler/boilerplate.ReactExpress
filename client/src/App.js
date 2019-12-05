import React, { Component } from 'react';
import * as d3 from "d3";

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// css
import './App.css';

import logo from './logo.svg';

// d3 components
import MapVis from "./mapVis";
import BrushVis from "./brushVis"


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            initData: [],
            dataRange: [],
            displayData: []
        };
    }

    componentDidMount() {
        // after component mounted, load data
        this.loadData();
    }

    loadData(){
        fetch('/api/loadData')
            .then(res => res.json())
            .then(data => console.log(data));
    }

    // callback function that enables communication with brush
    setNewRange = (brushRange) => {
        this.setState({dataRange: brushRange});
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        // when component updates, i.e. state changes (e.g. the range due to brushing), call filterData
        this.filterData();
    }

    filterData(){
        let filteredData = [];
        this.setState({displayData: filteredData})
    }

    // prepare grid
    render() {
        return (
            <div className="App">

                {/* wrapper */}
                <Container fluid={true}>
                    <Row style={{height: '100vh', padding: '1vh'}}>
                        <Col lg={{span: 10, offset:1}} style={{background: '#d8d8d8', border: ' thin solid grey', borderRadius: '5px'}}>

                            {/* header */}
                            <Row id="header" className="justify-content-center">
                                <div className="align-self-center">
                                    <h1>Map, Scatter, Brush</h1>
                                </div>
                            </Row>

                            {/* content */}
                            <Row style={{height: '65vh'}}>
                                <Col lg={7}>
                                    <Row className="test"><MapVis data={this.state.displayData}/></Row>
                                </Col>
                                <Col lg={5}>
                                    <Row className="test"><MapVis data={this.state.displayData}/></Row>
                                </Col>
                            </Row>

                            {/* footer / brush */}
                            <Row style={{height: '20vh'}}>
                                <Col>
                                    <Row style={{height: '17vh', marginTop: '2vh',  marginLeft: '0', marginRight: '0', background: 'lightgrey', border: 'thin solid grey', borderRadius: '5px'}}>
                                        <BrushVis parentCallback={this.setNewRange}/>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
