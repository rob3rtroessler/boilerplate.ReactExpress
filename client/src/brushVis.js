import React, {Component} from 'react';
import Spinner from 'react-bootstrap/Spinner';
import * as d3 from "d3";

class BrushVis extends Component {
    constructor(props) {
        super(props);

        // set state
        this.state = {
            loading: true,
            data: this.props.data,
            vis: {}
        };
    }

    // method that is fired once component mounts
    componentDidMount() {

        // logs
        console.log('component did mount', this.state, this.props);

        // when component mounts, call loadData and initVis method
        this.loadData();
        this.initVis();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('in: componentDidUpdate');
        this.updateVis();
    }

    render(){
        if(this.state.loading){
            return(
                <div id='brushVis' style={{height: '100%', width: '100%'}}>
                    <div className="text-center" style={{height: '100%', width: '100%'}}>
                        <Spinner animation="grow" variant="warning" className="mx-auto align-self-center" />
                    </div>
                </div>
            );
        } else{
            return (
                <div id='brushVis' style={{height: '100%', width: '100%'}}/>
            );
        }
    }

    // method that communications brush range to parent
    sendDataToParent = (range) => {
        console.log('sendDataToParent() is called, sending', range);
        this.props.parentCallback(range);
    };

    // load data
    loadData(){
        let component = this;

        // logs
        console.log('component did mount fired, loading data now');

        // load data
        d3.csv("data.csv").then( function(data){
            console.log('loading complete', data);

            // init wrangleData;
            let parseDate = d3.timeParse("%Y");

            data.forEach(function(d){
                d.date = parseDate(d.date);
                d.average = parseFloat(d.average);
                d.salary = parseFloat(d.salary);
            });

            let filteredData = data.sort(function(a,b){
                return a.date - b.date
            });

            let dataByDate = d3.nest()
                .key(function(d) { return d.date; })
                .entries(filteredData);

            let averageData = [];

            // iterate over each year
            dataByDate.forEach( year => {
                let tmpSum = 0;
                let tmpLength = year.values.length;
                let tmpDate = year.values[0].date;
                year.values.forEach( value => {
                    tmpSum += value.average;
                });

                averageData.push (
                    {date: tmpDate, average: tmpSum/tmpLength}
                )
            });

            // set new state;
            component.setState({initData: data, filteredData: filteredData, averageData: averageData, loading: false});
        });
    }


    // method that initializes the visualization - gets called by component did mount
    initVis() {
        let vis = this.state.vis;
        let component = this;
        let dimensions = document.getElementById('brushVis').getBoundingClientRect();

        // margin conventions
        vis.margin = {top: 50, right: 50, bottom: 20, left: 50};
        vis.width = dimensions.width - vis.margin.left - vis.margin.right;
        vis.height = dimensions.height - vis.margin.top - vis.margin.bottom;

        // init canvas
        vis.svg = d3.select('#brushVis').append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('Title for Timeline')
            .attr('transform', `translate(${vis.width/2}, -20)`)
            .attr('text-anchor', 'middle');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");

        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class','pathGroup');

        // init path one (average)
        vis.pathOne = vis.pathGroup
            .append('path')
            .attr("class", "pathOne");

        // init path two (single state)
        vis.pathTwo = vis.pathGroup
            .append('path')
            .attr("class", "pathTwo");

        // init path generator
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return vis.x(d.date); })
            .y0(vis.y(0))
            .y1(function(d) { return vis.y(d.average); });

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("end", function(){

                var d0 = d3.event.selection.map(vis.x.invert),
                    d1 = d0.map(d3.timeDay.round);

                console.log(d0, d1);
                // If empty when rounded, use floor & ceil instead.
                if (d1[0] >= d1[1]) {
                    d1[0] = d3.timeYear.floor(d0[0]);
                    d1[1] = d3.timeYear.offset(d1[0]);
                }

                //d3.select(this).call(d3.event.target.move, d1.map(vis.x));

                // grab currentBrushRegion, convert it to dates, and send range to parent
                let currentBrushRegion = d3.event.selection;
                if(currentBrushRegion){
                    component.sendDataToParent([ vis.x.invert(currentBrushRegion[0]), vis.x.invert(currentBrushRegion[1]) ]);
                }});
    }

    // update
    updateVis() {
        let vis = this.state.vis;
        let component = this;

        // update domains
        vis.x.domain( d3.extent(component.state.filteredData, function(d) { return d.date }) );
        vis.y.domain( d3.extent(component.state.filteredData, function(d) { return d.average }) );

        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(2));

        // draw pathOne
        vis.pathOne.datum(component.state.averageData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("clip-path", "url(#clip)");

        vis.brushGroup
            .call(vis.brush);
    }
}

export default BrushVis;