const w = 640;
const h= 400;
const xPad = 70;
const yPad = 50;

const tooltipW = 150;
const tooltipH = 50;

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

//Labels
svg.append('text')
.attr('x', -h/2-yPad)
.attr('y', 15)
.text('GDP (Billion)')
.attr('transform','rotate(-90)')
svg.append('text')
.attr('x', w/2-xPad)
.attr('y', h-10)
.text('Year quarter')
//Title
svg.append('text')
.attr('id','title')
.attr('x', w/2-xPad)
.attr('y',20)

.text('United States GDP')

//Fetch data
//Data format [yyyy-mm-dd,gdp]
const quarters = {"01": "Q1", "04": "Q2", "07": "Q3", "10": "Q4"}
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(data => {
        // extract year and quarter for displaying info
        const years = data.data.map((item) =>{
            const quarter = quarters[item[0].substring(5,7)];
            return item[0].substring(0,4) + ' ' + quarter;
        });
        // transform to date objects for plotting
        const dates = data.data.map(item => {
            return new Date(item[0])
        })
        //Define time scale
        const xMax = new Date(d3.max(dates))
        //Set the maximum of th scale to the last quarter of the last year recorded
        xMax.setMonth(xMax.getMonth()+3)
        const xScale = d3.scaleTime()
        .domain([d3.min(dates),xMax])
        .range([xPad,w-xPad]);
        //Create x axis
        const xAxis = d3.axisBottom().scale(xScale);
        
        //Handle GDP
        const gdp = data.data.map(item => item[1]);
        //define yScale
        const yMax = d3.max(gdp);
        const yScale = d3.scaleLinear()
        .domain([0,yMax])
        .range([h-yPad,yPad]);
        //Create yAxis
        const yAxis = d3.axisLeft().scale(yScale);
        console.log(yScale(0))

        //Insert axii
        svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr('transform',`translate(0,${h-yPad})`)
        
        svg.append('g')
        .call(yAxis)
        .attr('id','y-axis')
        .attr('transform',`translate(${xPad},0)`);

        //Create bars
        //Get the number of data points
        const n = data.data.length;
        //Set width of bar
        const barW = w / n;

        svg.append('g')
        .selectAll('rect')
        .data(gdp)
        .enter()
        .append('rect')
        .attr('data-date',(d,i)=> data.data[i][0])
        .attr('data-gdp',(d,i)=> data.data[i][1])
        .attr('class','bar')
        .attr('x',(d,i)=>xScale(dates[i]))
        .attr('y',d => yScale(d))
        .attr('width',barW)
        .attr('height',d => h-yScale(d)-yPad)
        .attr('index',(d,i) => i)
        .on('mouseenter', function(event,d){
            const i = this.getAttribute('index');
            
            let x = parseFloat(this.getAttribute('x'));
            if( x < w - tooltipW - xPad){
                x += xPad/2;
                console.log(x);
            }else{
                x -= (tooltipW+xPad/2);
            }
            
            tooltip.style('transform',`translate(${x}px,${-tooltipH - 100}px)`)
            .html(
                years[i] + '<br>' + gdp[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + 'Billion'
            ).attr("class","show");
            //Change corresponding bar style
            d3.select(`.bar[index="${i}"]`).attr('class','bar active');
        })
        .on('mouseleave', (i) =>{
            tooltip.attr("class","");
            d3.selectAll(".bar.active").attr('class','bar');
        })

        svg.append('g')
        .selectAll('rect')
        .data(gdp)
        .enter()
        .append('rect')
        .attr('class','hoverBar')
        .attr('x',(d,i)=>xScale(dates[i]))
        .attr('y',yPad)
        .attr('width',barW)
        .attr('height',h-2*yPad)
        .attr('index',(d,i) => i)
        


    })
    .catch(e => console.log(e));