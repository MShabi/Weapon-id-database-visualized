console.clear();

let height = window.innerHeight;
let width = window.innerWidth;
// -------------------------------------------- //
// Carte
// récuperer les coordonnées pour dessiner les pays
d3.json('regionsPoly.json', donnees => {

  console.log(donnees)

  // ici, les données sont chargées
  const region_id = topojson.feature(donnees, donnees.objects.regionsPoly);

  console.log(region_id);

  const chemins = canevas.selectAll('path')
    .data(region_id.features);

  chemins.enter()
    .append('path')
      .attr('class','pays')
      .attr('id', d => d.properties['NAME'])
      .attr('d', genererChemins);

});

const canevas = d3.select('#map')
  .attr('height', height / 2)
  .attr('width', width / 4 );
// choisir la projection
const maProjection = d3.geoKavrayskiy7().scale(80).translate([width /7 ,height/5 ]);

// la passer en paramètre du générateur de chemins
const genererChemins = d3.geoPath().projection(maProjection);

//dessiner les chemins
canevas.append('path')
  .attr('class','monde')
  .attr('d',genererChemins({type :'Sphere'}))


// +-------------------+---------------+----- //
// Réseau et histogramme
d3.json("WeaponsDB.json", d => {

  // ----------------------------------------------- //
  // Histogramme

  var canvasBarres = d3.select('#hist')
    .attr('height', height / 2)
    .attr('width', width / 1.5)

  var partype = d3.nest()
    .key(function(d){
      return d.type;
    })
    .rollup(function(d){
      return d.length;
    })
    .entries(d)
    .sort((a,b) => d3.ascending(a.value,b.value))

  console.log(partype);

  console.log(partype.type);


  // Histogram data creating from raw
  var typeParRegion = d3.nest()
    .key(d => d.type)
    .key(d => d.regions)
    .rollup(function(d){
      return d.length;
    })
    .entries(d)
    .sort((a,b) => d3.ascending(a.value,b.value))

  console.log(typeParRegion);

  const regions = ["Western Europe", "Eastern Europe",
  "Middle East & North Africa", "Sub-Saharan Africa", "Central Asia",
  "South Asia", "East Asia", "Pacific", "North America", "Central America",
  "South America"]

  var histDat = [];
  var tableRegionType = [];

  for (un of typeParRegion){    //Iterate on nested by type and region data

    regions.forEach(function(reg) { // Iterate on regions

      var valueOfRegionForType = 0;

      for (obj of un.values){       // Iterating on the groups of regions of each type

        //console.log(obj.key.split(', '),'//////',obj.value);

        if(obj.key.includes(reg)){

          var valueOfRegionForType = valueOfRegionForType + obj.value;

        };

        console.log(obj.key.includes(reg));
        console.log(reg + valueOfRegionForType);

      }

      tableRegionType.push({
        type: un.key,
        region: reg,
        value: valueOfRegionForType
      });

    });

    console.log(tableRegionType);
    console.log(un.values,'///////',un.key);
  }

  typeParRegion.forEach(function(type){

    var filtrParType = tableRegionType.filter(region =>
      type.key===region.type);

    console.log(filtrParType[0].value, filtrParType[0].type, filtrParType[0].region);
    histDat.push({
      type: filtrParType[0].type,
      westernEurope: filtrParType[0].value,
      easternEurope: filtrParType[1].value,
      middleEastNorthAfrica: filtrParType[2].value,
      subSaharanAfrica: filtrParType[3].value,
      centralAsia: filtrParType[4].value,
      southAsia: filtrParType[5].value,
      eastAsia: filtrParType[6].value,
      pacific: filtrParType[7].value,
      northAmerica: filtrParType[8].value,
      centralAmerica: filtrParType[9].value,
      southAmerica: filtrParType[10].value,
      sum: filtrParType[0].value + filtrParType[1].value + filtrParType[2].value + filtrParType[3].value + filtrParType[4].value + filtrParType[5].value + filtrParType[6].value + filtrParType[7].value + filtrParType[8].value + filtrParType[9].value + filtrParType[10].value
    })

  })

  console.log(histDat);

  // Definire des echelles
  var echelleX = d3.scaleLinear()
      .domain([0,d3.max(histDat, d => d.sum)])
      .range([20, 500]);

  // // Definire des couleure
  // const echelleC = d3.scaleLinear()
  //     .domain([0,d3.max(partype, d => d.value)])
  //     .range(['blue','red']);

  // Ajouter les barres
  let barres = canvasBarres.selectAll('rect')
      .data(histDat)
      .enter()
      .append('rect')
          .attr('x', 20)
          .attr('y', (d,i) => (i*14)+10)
          .attr('width', d => echelleX(d.sum))
          .attr('height', 10)
          .attr('fill', 'gray')
          .attr('class', 'barres');

  // Ajouter labels
  let labels = canvasBarres.selectAll('text')
      .data(histDat)
      .enter()
      .append('text')
          .attr('x', d => echelleX(d.sum)+30)
          .attr('y', (d,i) => (i*14)+18)
          .text(d => d.type)
          .attr('fill','white')
          .attr('class', 'labels')
          .attr('font-size', '10')

    canvasBarres.append('g')
      .classed('axeX', true)
      .attr('transform', 'translate(0,180)')
      .call(d3.axisBottom(echelleX));

  // -------------------------------------------------  //
  // On click of map polygon
  document.querySelector("path")
    .addEventListener('click', function(e){
      e.preventDefault();

      // update echelleX
      echelleX = d3.scaleLinear()
          .domain([0,d3.max(histDat, d => d.easternEurope)])
          .range([20, 500]);

      // update barres
      let barres = canvasBarres.selectAll('rect')
          .data(histDat)
          .transition()
          .duration(200)
              .attr('x', 20)
              .attr('y', (d,i) => (i*14)+10)
              .attr('width', d => echelleX(d.easternEurope))
              .attr('height', 10)
              .attr('fill', 'gray')
              .attr('class', 'barres');

      // update text
      let labels = canvasBarres.selectAll('text')
          .data(histDat)
          .transition()
          .duration(200)
              .attr('x', d => echelleX(d.easternEurope)+30)
              .attr('y', (d,i) => (i*14)+18)
              .text(d => d.type)
              .attr('fill','white')
              .attr('class', 'labels')
              .attr('font-size', '10')

        d3.select('.axeX').remove();

        canvasBarres.append('g')
          .classed('axeX', true)
          .attr('transform', 'translate(0,180)')
          .call(d3.axisBottom(echelleX));


    })


// -------------------------- //



  // Réseau Generer les noeuds
  // partype: Father node
  var partype = d3.nest()
    .key(function(d){
      return d.type;
    })
    .rollup(function(d){
          return d.length;
        })
        .entries(d)

  console.log(partype);

  var nodes = [];

  for (i in partype){
    nodes.push({
      name: partype[i].key,
      degree: partype[i].value,
      type: 'category'
    })
  }

  console.log(nodes);

  // parent weapons
  var parWeap = d.filter(d => d.name.includes('variants'));

  console.log(parWeap);

  for (i in parWeap){
    var strig = parWeap[i].name.match(/(\+)(\d+)/g)[0];

    var intstrig = parseInt(strig);

    nodes.push({
      name: parWeap[i].name,
      degree: intstrig,
      type: 'type'
    })
  }

  console.log(nodes);

  // variants
  var varWeap = d.filter(d => d.name.includes('- Variant of'))

  console.log(varWeap);

  for (i in varWeap){
    nodes.push({
      name: varWeap[i].name,
      degree: 1,
      type: 'variant'
    })
  }

  console.log(nodes);

  // Generer les liens
  var liens = [];

  // category à type
  for (i in partype) {
    for (j in parWeap) {
      if (partype[i].key == parWeap[j].type){
        liens.push({
          source: partype[i].key,
          target: parWeap[j].name
        })
      }
    }
  }

  console.log(liens);

  // type à variant
  for (n of varWeap){
         var shrtnm = n.name;
         console.log(shrtnm);
         var regex = /(?:- Variant of )(.+$)/;
         var shortName = shrtnm.match(regex);
         console.log(shortName);
         if(shortName){
           var parentWeap = parWeap.filter(d => d.name.includes(shortName[1]));
             liens.push({
               source: parentWeap[0].name,
               target: shrtnm
             })
         }

  }
  console.log(liens);

  var links = liens
  console.log(links);

  // Making data file
  var data = {
    nodes: nodes,
    links: links
  };

  console.log(data);

  console.log(data.links[0]);

  // Color scale nodes
  var echelleLiens1 = d3.scaleOrdinal()
    .domain(['category', 'type', 'variant'])
    .range(['#d95f0e',  '#fec44f', '#fff7bc'])

  // size scale nodes
  var echelleTaille = d3.scaleLinear()
    .domain([1,57])
    .range([2,12])

  // Simple network:
  var svg = d3.select('#network')
    .attr('height', height / 1.5)
    .attr('width', (width / 3))

  // initialize links
  var link = svg.selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")

  // Initialize the nodes
  var node = svg.selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("r", d => echelleTaille(d.degree))
      .attr('class', 'nodes')
      .attr('fill', d => echelleLiens1(d.type) )

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d,i) { return d.name; })                     // This provide  the id of a node
            .links(data.links)                                    // and this the list of links

      )
      .force("charge", d3.forceManyBody().strength(-1.2))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 5, height /3))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

  function ticked() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
       .attr("cx", function (d) { return d.x; })
       .attr("cy", function(d) { return d.y; });
}

});
