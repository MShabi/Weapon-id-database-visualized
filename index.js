console.clear();

// Paramètres
let height = window.innerHeight;
let width = window.innerWidth;
var active;
var activeHist;

// -------------------------------------------- //
// Carte
// Choix de projection
const maProjection = d3.geoKavrayskiy7().scale(80).translate([width /7 ,height/5 ]);

// la passer en paramètre du générateur de chemins
const genererChemins = d3.geoPath().projection(maProjection);

// Creation canevas
const canevas = d3.select('#map')
  .attr('height', height / 1.5)
  .attr('width', width / 4 )

// Ajout boite click reset
canevas.append('rect')
  .attr('width', width/3)
  .attr('height', height/0.5)
  .attr('id', 'reset_map')
  .classed('clickReset', true)
  .on('click', reset);

// Modif caneva pour avoir des groupes
var g = canevas.append('g');

// récuperer les coordonnées pour dessiner les pays
d3.json('regionsPoly.json', donnees => {

  // ici, les données sont chargées
  const region_id = topojson.feature(donnees, donnees.objects.regionsPoly);

  const chemins = g.selectAll('path')
    .data(region_id.features)
    .enter()
    .append('path')
      .attr('class','feature')
      .attr('d', genererChemins)
      .on('click', mapClick);

});

// +-------------------+---------------+----- //
// Réseau et histogramme
// Recuperer donnes scrapée
d3.json("WeaponsDB.json", d => {

  // ----------------------------------------------- //
  // Histogramme

  // Canevas
  var canvasBarres = d3.select('#hist')
    .attr('height', height / 2)
    .attr('width', width / 1.5)

  // Nest données par type d'armes et région distribution
  var typeParRegion = d3.nest()
    .key(d => d.type)
    .key(d => d.regions)
    .rollup(function(d) { return d.length; })
    .entries(d)
    .sort((a,b) => d3.ascending(a.value,b.value))

  // Régions de distribution, utilisé pour itérer
  const regions = ["Western Europe", "Eastern Europe",
  "Middle East & North Africa", "Sub-Saharan Africa", "Central Asia",
  "South Asia", "East Asia", "Pacific", "North America", "Central America",
  "South America"]

  histDat = [];

  var tableRegionType = [];

  for (un of typeParRegion){    //Iterate on nested by type and region data
    regions.forEach(function(reg) { // Iterate on regions
      var valueOfRegionForType = 0;
      for (obj of un.values){       // Iterating on the groups of regions of each type
        if(obj.key.includes(reg)){
          var valueOfRegionForType = valueOfRegionForType + obj.value;
        };
      }
      tableRegionType.push({
        type: un.key,
        region: reg,
        value: valueOfRegionForType
      });
    });

    // console.log(tableRegionType);

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

  // console.log(histDat);

  // Definire des echelles
  echelleX = d3.scaleLinear()
      .domain([0,d3.max(histDat, d => d.sum)])
      .range([20, 500]);

 resteBoxHist = canvasBarres.append('rect')
    .attr('width', width / 4)
    .attr('height', height / 4)
    .attr('id', 'reset_hist')
    .classed('clickReset', true)
    .on('click', histReset);

  // Ajouter les barres
  barres = canvasBarres
  .append('g')
  .selectAll('rect')
      .data(histDat)
      .enter()
      .append('rect')
          .attr('x', 20)
          .attr('y', (d,i) => (i*14)+10)
          .attr('width', d => echelleX(d.sum))
          .attr('height', 10)
          .attr('fill', 'gray')
          .attr('class', 'feature')
          .on('click', histClick);

  // Ajouter labels
  labels = canvasBarres
  .append('g')
  .selectAll('text')
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

  // let regenHisto = function (d) {
  //   var idPoly = d.properties['FIPS'];
  //
    // appartenances = [{
    //   centralAmerica: 'AC'},
    //   {centralAsia: 'NP'},
    //   {eastAsia: 'MC'},
    //   {easternEurope: 'RO'},
    //   {middleEastNorthAfrica: 'AJ'},
    //   {northAmerica: 'GL'},
    //   {pacific: 'NH'},
    //   {southAmerica: 'BR'},
    //   {southAsia: 'BM'},
    //   {subSaharanAfrica: 'GH'},
    //   {westernEurope: 'GM'}]

  //
  //   console.log(idPoly);
  // }
  // // update echelleX
  // echelleX = d3.scaleLinear()
  //     .domain([0,d3.max(histDat, d => d.easternEurope)])
  //     .range([20, 500]);
  //
  // // update barres
  // let barres = canvasBarres.selectAll('rect')
  //     .data(histDat)
  //     .transition()
  //     .duration(200)
  //         .attr('x', 20)
  //         .attr('y', (d,i) => (i*14)+10)
  //         .attr('width', d => echelleX(d.easternEurope))
  //         .attr('height', 10)
  //         .attr('fill', 'gray')
  //         .attr('class', 'barres');
  //
  // // update text
  // let labels = canvasBarres.selectAll('text')
  //     .data(histDat)
  //     .transition()
  //     .duration(200)
  //         .attr('x', d => echelleX(d.easternEurope)+30)
  //         .attr('y', (d,i) => (i*14)+18)
  //         .text(d => d.type)
  //         .attr('fill','white')
  //         .attr('class', 'labels')
  //         .attr('font-size', '10')
  //
  //   d3.select('.axeX').remove();
  //
  //   canvasBarres.append('g')
  //     .classed('axeX', true)
  //     .attr('transform', 'translate(0,180)')
  //     .call(d3.axisBottom(echelleX));





  // var names = ['westernEurope', 'easternEurope', 'middleEastNorthAfrica',
  //  'subSaharanAfrica', 'centralAsia', 'southAsia', 'eastAsia', 'pacific',
  //   'northAmerica', 'centralAmerica', 'southAmerica']



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

  //console.log(partype);

  var nodes = [];

  for (i in partype){
    nodes.push({
      name: partype[i].key,
      degree: partype[i].value,
      type: 'category'
    })
  }

  //console.log(nodes);

  // parent weapons
  var parWeap = d.filter(d => d.name.includes('variants'));

  //console.log(parWeap);

  for (i in parWeap){
    var strig = parWeap[i].name.match(/(\+)(\d+)/g)[0];

    var intstrig = parseInt(strig);

    nodes.push({
      name: parWeap[i].name,
      degree: intstrig,
      type: 'type'
    })
  }

  //console.log(nodes);

  // variants
  var varWeap = d.filter(d => d.name.includes('- Variant of'))

  //console.log(varWeap);

  for (i in varWeap){
    nodes.push({
      name: varWeap[i].name,
      degree: 1,
      type: 'variant'
    })
  }

  //console.log(nodes);

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

  //console.log(liens);

  // type à variant
  for (n of varWeap){
         var shrtnm = n.name;
         //console.log(shrtnm);
         var regex = /(?:- Variant of )(.+$)/;
         var shortName = shrtnm.match(regex);
         //console.log(shortName);
         if(shortName){
           var parentWeap = parWeap.filter(d => d.name.includes(shortName[1]));
             liens.push({
               source: parentWeap[0].name,
               target: shrtnm
             })
         }

  }
  //console.log(liens);

  var links = liens
  console.log(links);

  // Making data file
  var data = {
    nodes: nodes,
    links: links
  };

  console.log(data);

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

  function histClick(d) {
    if (active === d) return histReset();
    d3.select('#hist').selectAll(".active").classed('active', false);
    d3.select(this).classed('active', active = d);
    console.log(this);

// interactivité avec réseau
    console.log(this.__data__.type);

    if(this.__data__.type === 'Pistol') {
    }


  }

  function histReset() {
      d3.select('#hist').selectAll(".active").classed("active", active = false);
      d3.select('#hist').transition().duration(450).attr('transform','');
      console.log(this);
  }

});

function mapClick(d) {
  if (active === d) return reset();
  canevas.selectAll(".active").classed('active', false);
  d3.select(this).classed('active', active = d);

  console.log('suck my dick MAX <3');   //-----------------------------------
  console.log(this.__data__.properties['FIPS']);  //-----------------------------------

  // let updBarres(changer) => d3.select('#hist').selectAll('rect')
  //     .data(histDat)
  //     .transition()
  //     .duration(200)
  //         .attr('x', 20)
  //         .attr('y', (d,i) => (i*14)+10)
  //         .attr('width', changer)
  //         .attr('height', 10)
  //         .attr('fill', 'gray')
  //         .attr('class', 'barres');
  //
  // let updTexte(changer) => d3.select('#hist').selectAll('rect')
  //     .data(histDat)
  //     .transition()
  //     .duration(200)
  //         .attr('x', 20)
  //         .attr('y', (d,i) => (i*14)+10)
  //         .attr('width', d => changer)
  //         .attr('height', 10)
  //         .attr('fill', 'gray')
  //         .attr('class', 'barres');

  nomPoly = this.__data__.properties['FIPS'];
  // for (appa of appartenances){
  //   console.log(Object.values(appa)[0]);
  //   nameApp = Object.values(appa)[0];
  //
  //   if (nomPoly === nameApp){
  //     echelleX = d3.scaleLinear()
  //         .domain([0,d3.max(histDat, d => d.southAmerica)])
  //         .range([20, 500]);
  //
  //     d3.select('#hist').selectAll('rect')
  //         .data(histDat)
  //         .transition()
  //         .duration(200)
  //             .attr('x', 20)
  //             .attr('y', (d,i) => (i*14)+10)
  //             .attr('width', d => echelleX(d.southAmerica))
  //             .attr('height', 10)
  //             .attr('fill', 'gray')
  //             .attr('class', 'barres');
  //
  //     d3.selectAll('text')
  //         .data(histDat)
  //         .transition()
  //         .duration(200)
  //             .attr('x', d => echelleX(d.southAmerica)+30)
  //             .attr('y', (d,i) => (i*14)+18)
  //             .text(d => d.type)
  //             .attr('fill','white')
  //             .attr('class', 'labels')
  //             .attr('font-size', '10')
  //
  //       d3.select('.axeX').remove();
  //
  //       d3.select('#hist').append('g')
  //         .classed('axeX', true)
  //         .attr('transform', 'translate(0,180)')
  //         .call(d3.axisBottom(echelleX));
  //   }
  // }
  if ( nomPoly === 'BR'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.southAmerica)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.southAmerica))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.southAmerica)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'GL'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.northAmerica)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.northAmerica))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.northAmerica)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'GM'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.easternEurope)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.easternEurope))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
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

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'NH'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.pacific)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.pacific))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.pacific)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'BM'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.southAsia)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.southAsia))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.southAsia)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'RO'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.easternEurope)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.easternEurope))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
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

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'NP'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.centralAsia)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.centralAsia))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.centralAsia)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'AC'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.centralAmerica)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.centralAmerica))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.centralAmerica)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'MC'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.eastAsia)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.eastAsia))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.eastAsia)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'AJ'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.middleEastNorthAfrica)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.middleEastNorthAfrica))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.middleEastNorthAfrica)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
  if ( nomPoly === 'GH'){
    echelleX = d3.scaleLinear()
        .domain([0,d3.max(histDat, d => d.subSaharanAfrica)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*14)+10)
            .attr('width', d => echelleX(d.subSaharanAfrica))
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(histDat)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.subSaharanAfrica)+30)
            .attr('y', (d,i) => (i*14)+18)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,180)')
        .call(d3.axisBottom(echelleX));


  }
}

function reset() {
  canevas.selectAll(".active").classed("active", active = false);
  canevas.transition().duration(750).attr('transform','');
  console.log('No you suck my dick Nico!');
  console.log('reset for map');

  echelleX = d3.scaleLinear()
      .domain([0,d3.max(histDat, d => d.sum)])
      .range([20, 500]);

  d3.select('#hist').selectAll('rect')
      .data(histDat)
      .transition()
      .duration(200)
          .attr('x', 20)
          .attr('y', (d,i) => (i*14)+10)
          .attr('width', d => echelleX(d.sum))
          .attr('height', 10)
          .attr('fill', 'gray')
          .attr('class', 'feature');

  d3.selectAll('text')
      .data(histDat)
      .transition()
      .duration(200)
          .attr('x', d => echelleX(d.sum)+30)
          .attr('y', (d,i) => (i*14)+18)
          .text(d => d.type)
          .attr('fill','white')
          .attr('class', 'labels')
          .attr('font-size', '10')

    d3.select('.axeX').remove();

    d3.select('#hist').append('g')
      .classed('axeX', true)
      .attr('transform', 'translate(0,180)')
      .call(d3.axisBottom(echelleX));

}
