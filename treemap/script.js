const w = 1080;
const h= 720;
const xPad = 50;
const yPad = 50;

const legW = w-2*xPad;
const legH = h-2*yPad;
const xLeg = xPad;
const yLeg = h-2*yPad;
const legItemW = 110;
const legItemH = 30;
const legItemM = 20;
const itemRows = Math.floor(legW / legItemW);

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

//Create legend element
const legend = svg.append('g')
.attr("id","legend");


//Kickstarter dataset
const kickstarterURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const gamesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const moviesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
//Data has structure
// {name, children: [{name, children: [{name,children}...]},...]}
//Fetch data
d3.json(gamesURL).then(data => {
    
    //Generate hierarchy
    const hierarchy = d3.hierarchy(data)
    .sum(d => d.value)//use the value property of each node to calculate the area of the squares
    .eachBefore(function (d) {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
      })
    .sort((a, b) => b.height - a.height || b.value - a.value);
    //Define tree map object considering padding on the svg and padding between squares
    const treemap = d3.treemap().size([w-2*xPad,h-2*yPad]).paddingInner(1)(hierarchy);

    // Create color scale
    const colorScale = d3.scaleOrdinal(data.children.map(d => d.category),d3.schemeTableau10.map(color => d3.interpolateRgb(color,'#fff')(0.1)));
    //Generate tiles
    //Separate the children and parents using descendants in the treemap, this have depth 0, 1, 2, ...
    //I our case depth 1 corresponds to the categories and depth 2 to the items in each category
    const parents = treemap.descendants().filter(d => d.depth==1)
    const children = treemap.descendants().filter(d => d.depth==2)

    //Create the tiles
    const cells = svg.selectAll('.tile')
    .data(children)
    .enter()
    .append('rect')
    .attr('class','tile')
    .attr('x',d => d.x0)
    .attr('y',d => d.y0)
    .attr('width',d => d.x1 -d.x0)
    .attr('height',d => d.y1 - d.y0)
    // .attr('stroke','white')
    .attr('fill',d => colorScale(d.data.category))
    .attr('data-name', d => d.data.name)
    .attr('data-category',d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('index',(d,i) => i)
    .on('mouseenter', function(event,d){

        let x = (d.x1 + d.x0) / 2;
        if( x < w - tooltipW - xPad){
            x += xPad/2;
        }else{
            x -= (tooltipW+xPad/2);
        }
        let y = (d.y1 + d.y0 ) / 2;
        if( y < h - tooltipH - yPad){
            y += yPad/2;
        }else{
            y -= (tooltipH + yPad);
        }
        tooltip.style('transform',`translate(${x}px,-${h-y}px)`)
        .html(
            `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
        )
        .attr("class","show").attr('data-value', d.data.value);
    }).on('mouseleave', (d) =>{
        tooltip.attr("class","");
    })

    svg.selectAll('text')
    .data(children)
    .enter()
    .append('text')
    .each(function(d){
        
        const textElement = d3.select(this);
        const x = d.x0 + 5;
        const y = d.y0 + 20;

        textElement.selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x',d => x)
        .attr('y', (d, i) => y + i*10)
        .text(d => d)
        .style('font-size','10px')

    });

    //Legend

    const legendItems = legend.selectAll('g')
    .data(parents).enter()
    .append('g')
    .attr('width',legItemW-1)
    .attr('height', legItemH-1);

    legendItems.append('rect').attr('class','legend-item')
    .attr('x',(d,i) => xLeg + 5 + (i%itemRows)*legItemW )
    .attr('width',legItemM)
    .attr('y',(d,i) => yLeg + 10 + Math.floor(i/itemRows)*legItemH )
    .attr('height',legItemM)
    .attr('fill', d => colorScale(d.data.name));

    legendItems.append('text')
    .attr('x',(d,i) => xLeg + 10 + legItemM + (i%itemRows)*legItemW )
    .attr('y',(d,i) => yLeg + 5 + legItemM + Math.floor(i/itemRows)*legItemH )
    .text( d => d.data.name);
}).catch(e => console.log(e));