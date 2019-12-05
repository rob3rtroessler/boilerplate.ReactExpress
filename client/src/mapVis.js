import React, {Component} from 'react';
import * as d3 from "d3";
import * as topojson from "topojson-client";


class MapVis extends Component {

    // constructor
    constructor(props) {
        super(props);

        // set state
        this.state = {};
    }

    componentDidMount() {
        // this.loadData();
        // this.initVis();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //this.updateVis()
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}} id='mapVis'>Map</div>
        );
    }
}

export default MapVis;



