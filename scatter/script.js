const w = 1080;
const h= 720;
const xPad = 70;
const yPad = 50;
const xLeg = w - xPad - 250;
const yLeg = yPad + 100;

const tooltipW = 250;
const tooltipH = 80;

//Create svg element
const svg = d3.select("#chart")
.append('svg')
.attr('width',w)
.attr('height',h);

//Create tooltip element
const tooltip = d3.select("#chart")
.append('div')
.attr('id','tooltip')
.style('height',tooltipH+'px')
.style('width',tooltipW+'px');

//Create legend element
const legend = svg.append('g')
.attr("id","legend");
//legend label_1
const legend_1 = legend.append('text')
.attr('x',xLeg + 15).attr('y',h-yLeg)
.text("No doping allegations")
.attr('class','leg-label');
const leg_marker_1 = legend.append('circle')
.attr('cx',xLeg).attr('cy',h-yLeg-5).attr('r',5)
.attr('class','leg-marker').attr('fill','#075985');
//legend label_2
const legend_2 = legend.append('text')
.attr('x',xLeg + 15).attr('y',h-yLeg-20)
.text("Riders with doping allegations")
.attr('class','leg-label');
const leg_marker_2 = legend.append('circle')
.attr('cx',xLeg).attr('cy',h-yLeg-5-20).attr('r',5)
.attr('class','leg-marker').attr('fill','#991b1b');


//Labels
svg.append('text')
.attr('x', -h/2-yPad)
.attr('y', 15)
.text('Time (min)')
.attr('transform','rotate(-90)')
svg.append('text')
.attr('x', w/2-xPad)
.attr('y', h-10)
.text('Year')
//Title
svg.append('text')
.attr('id','title')
.attr('x', w/2-xPad-40)
.attr('y',20)
.text('Doping in Professional Bicycle Racing')
svg.append('text')
.attr('id','sub-title')
.attr('x', w/2-xPad)
.attr('y',40)
.text("35 Fastest times up Alpe d'Huez");

//Fetch data
//Data format [data_point0,data_point1,...]
//data_point = {Time, Place, Seconds, Name, Year, Nationality, Doping, URL}
//Time is in the format mm:ss and year is an int
const quarters = {"01": "Q1", "04": "Q2", "07": "Q3", "10": "Q4"}
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
    .then(data => {
        //We can use the year directly
        const years = data.map(item => item.Year);
        
        //Define time scale
        const xMax = d3.max(years) + 1; //Add one year for padding
        const xMin = d3.min(years) -1; //Subtract one year for padding
        const xScale = d3.scaleLinear()
        .domain([xMin,xMax])
        .range([xPad,w-xPad]);
        //Create x axis
        const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'));
        
        //We need to parse the time
        const records = data.map(item => {
            const minSec = item.Time.split(':');
            //Use Unix epoch as reference
            return new Date(1970,0,1,0,minSec[0],minSec[1]);
        });
        // console.log(records[0]);
        //Add 15sec padding for the y axis
        const yMax = d3.max(records);
        yMax.setSeconds(yMax.getSeconds()+15);
        const yMin = d3.min(records);
        yMin.setSeconds(yMin.getSeconds()-15)
        const yScale = d3.scaleTime()
        .domain([yMin,yMax])
        // .domain(d3.extent(records)) //We could have used extent but we wouldn't have the padding
        .range([h-yPad,yPad]);
        //Create yAxis
        const yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.timeFormat('%M:%S'));

        //Insert axii
        svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr('transform',`translate(0,${h-yPad})`)
        
        svg.append('g')
        .call(yAxis)
        .attr('id','y-axis')
        .attr('transform',`translate(${xPad},0)`);

        //Create circles
        //Set circle radius
        const r = 10;
        //Coloring function
        function doping(s){
            if(s.length > 0){
                return '#991b1b95';
            }else{
                return '#07598595';
            }
        }

        svg.append('g')
        .selectAll('.dot')
        .data(records)
        .enter()
        .append('circle')
        .attr('class','dot')
        // .attr('data-date',(d,i)=> data.data[i][0])
        // .attr('data-gdp',(d,i)=> data.data[i][1])
        .attr('cx',(d,i)=>xScale(years[i]))
        .attr('data-xvalue',(d,i)=>years[i])
        .attr('cy',d => yScale(d))
        .attr('data-yvalue',d=>d)
        .attr('r',r)
        .attr('fill',(d,i) => doping(data[i].Doping))
        .attr('index',(d,i) => i)
        .on('mouseenter', function(event,d){
            const i = this.getAttribute('index');
            
            let x = parseFloat(this.getAttribute('cx'));
            if( x < w - tooltipW - xPad){
                x += xPad/2;
            }else{
                x -= (tooltipW+xPad/2);
            }
            let y = parseFloat(this.getAttribute('cy'));
            if( y < h - tooltipH - yPad){
                y += yPad/2;
            }else{
                y -= (tooltipH + yPad);
            }
            
            tooltip.style('transform',`translate(${x}px,-${h-y}px)`)
            .html(
                data[i].Name + ': ' + data[i].Nationality + '<br>'
                + 'Year: ' + data[i].Year + ', Time:' + data[i].Time
                +'<br><br>' + data[i].Doping
            ).attr("class","show").attr('data-year',(data[i].Year));
        })
        .on('mouseleave', (d) =>{
            tooltip.attr("class","");
        })

    })
    .catch(e => console.log(e));