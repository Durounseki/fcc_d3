const w = 1080;
const h= 720;
const xPad = 100;
const yPad = 150;

colors = ["#bfc9e2","#9bb9d9","#72a8cf","#4394c3","#1a7db6","#0667a1","#045281","#023858"];
const legW = 250;
const legH = 200 / colors.length;
const xLeg = w - xPad - legW;
const yLeg = yPad + legH;

const tooltipW = 250;
const tooltipH = 80;

//Title
d3.select('#chart')
.append('h1')
.attr('id','title')
.text('United States Education Attainment')
//Description
d3.select('#chart')
.append('p')
.attr('id','description')
.text("Percentage of adults 25 and older with a bachelor's degree or higher (2010-2014)");

//Create svg element
const svg = d3.select("#chart")
.append('svg')
.attr('width',w)
.attr('height',h);

//Create tooltip element
const tooltip = d3.select("#chart")
.append('div')
.attr('id','tooltip')
// .style('height',tooltipH+'px')
// .style('width',tooltipW+'px');

//Create legend element
const legend = svg.append('g')
.attr("id","legend");


//Make map
const mapURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
//Data contains objects: { counties, nation, states}
//Which contain the necessary geometries, we only need the conties
const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
//Data contains array of objects {fips,state,area_name,bachelorsOrHigher}
//Fetch data
Promise.all([d3.json(mapURL),d3.json(educationURL)])
    .then(([map, education]) => {
        //Create color scale
        const percentages = education.map(item => item.bachelorsOrHigher);
        const pMax = d3.max(percentages);
        const pMin = d3.min(percentages);

        function quantize(min,max,count){
            const arr = [];
            const step = (max-min)/count;
            for(let i=1; i<count; i++){
                arr.push(min+i*step);
            }
            return arr;
        }

        const colorScale = d3.scaleThreshold()
        .domain(quantize(pMin, pMax, colors.length)).range(colors);
        const legScale = d3.scaleLinear()
        .domain([pMin,pMax]).range([0,legW]);
        //Create legend Axis
        const legAxis = d3.axisBottom().scale(legScale)
        .tickValues(colorScale.domain()).tickFormat(p => Math.round(p) + '%');
        //Insert color bar
        legend.append('g').selectAll('rect')
        .data(
            colorScale.range().map(color => {
                //Invert the threshold
                const bounds = colorScale.invertExtent(color);
                //Check for endpoints
                if(bounds[0]===null){
                    bounds[0]=legScale.domain()[0];
                }
                if(bounds[1]==null){
                    bounds[1]=legScale.domain()[1];
                }
                return bounds;
            })
        ).enter()//Insert rectangles
        .append('rect')
        .attr('fill',d => colorScale(d[0]))
        .attr('x',d => legScale(d[0]))
        .attr('width', d => d[0] && d[1] ? legScale(d[1])-legScale(d[0]) : legScale(null) )//Need to figure out how to calculate the width correctly
        .attr('height',legH)
        .attr('transform',`translate(${xLeg-xPad}, 0 )`);
        //Append legend scale
        legend.append('g').call(legAxis)
        .attr('transform',`translate(${xLeg-xPad}, ${legH} )`);


        //Create a geopath with d3
        const path = d3.geoPath();
        // draw the nation
        const counties = topojson.feature(map,map.objects.counties).features;

        svg.selectAll(".county")
        .data(counties)
        .enter().append('path')
        .attr('class','county')
        .attr('d',path)
        .attr('data-fips',d => d.id)
        .attr('data-education', d => {
            //Check if there is data for that county
            const record = education.filter( item => item.fips === d.id);
            if(record[0]){
                return record[0].bachelorsOrHigher;
            }else{
                console.log('Could not find data for: ', d.id);
                return 0;
            }
        }).attr('fill', d => {
            const record = education.filter( item => item.fips === d.id);
            if(record[0]){
                return colorScale(record[0].bachelorsOrHigher);
            }else{
                return colorScale(0);
            }
        }).attr('index',(d,i) => i)
        .on('mouseenter', function(event,d){
            const i = this.getAttribute('index');
                //Cannot get position from county directly, so we will use
                //position of the mouse instead
                let x = event.clientX;
                let y = event.clientY;
                tooltip.style('transform',`translate(${x-30}px,-${h-y+200}px)`)
                .html( () => {
                    const record = education.filter( item => item.fips === d.id);
                    if(record[0]){
                        return `${record[0].area_name} ,
                        ${record[0].state}: ${record[0].bachelorsOrHigher}%`;
                    }else{
                        return 0;
                    }
            }).attr("class","show").attr('data-education',() =>{
                const record = education.filter( item => item.fips === d.id);
                if(record[0]){
                    return record[0].bachelorsOrHigher;
                }else{
                    return 0;
                }
            });
        })
        .on('mouseleave', (d) =>{
            tooltip.attr("class","");
        })

    })
    .catch(e => console.log(e));