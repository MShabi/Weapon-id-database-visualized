var files = ["WeaponsDB.json", "regionsPoly.json"];
var promises = [];
let height = window.innerHeight;
let width = window.innerWidth;
var active;
var activeHist;

files.forEach(function(url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function(v, d) {



  // Making the histogram data from WeaponsDB
  var histDataBuilder = function(d) {
    // Nest données par type d'armes et région distribution
    var typeParRegion = d3.nest()
      .key(d => d.type)
      .key(d => d.regions)
      .rollup(function(d) { return d.length; })
      .entries(d)
      .sort((a,b) => d3.ascending(a.value,b.value))

    console.log(typeParRegion);

    // Régions de distribution, utilisé pour itérer
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
    return histDat;
  }

  // Drawing histogram
  var drawHist = function(histDat) {
    var canvasBarres = d3.select('body')
      .append('svg')
        .attr('height', height / 2)
        .attr('width', width / 2)
        .attr('id', 'hist')

        // Definire des echelles
        var echelleX = d3.scaleLinear()
            .domain([0,d3.max(histDat, d => d.sum)])
            .range([20, 500]);

       // var resteBoxHist = canvasBarres
       //  .append('rect')
       //    .attr('width', width / 4)
       //    .attr('height', height / 4)
       //    .attr('id', 'reset_hist')
       //    .classed('clickReset', true)
          //.on('click', histReset);

        // Ajouter les barres
        var barres = canvasBarres
        .append('g')
        .selectAll('rect')
            .data(histDat)
            .enter()
            .append('rect')
                .attr('x', 20)
                .attr('y', (d,i) => (i*24)+10)
                .attr('width', d => echelleX(d.sum))
                .attr('height', 19)
                .attr('fill', 'gray')
                .attr('class', 'feature')
                .on('click', histClick);

        // Ajouter labels
        var labels = canvasBarres
        .append('g')
        .selectAll('text')
            .data(histDat)
            .enter()
            .append('text')
                .attr('x', d => echelleX(d.sum)+30)
                .attr('y', (d,i) => (i*24)+23)
                .text(d => d.type)
                .attr('fill','white')
                .attr('class', 'labels')
                .attr('font-size', '10')

        // Ajouter axe
        var axeDeX = canvasBarres.append('g')
          .classed('axeX', true)
          .attr('transform', 'translate(0,297)')
          .call(d3.axisBottom(echelleX));
  }

  // Running Histogram
  var don = histDataBuilder(v[0]);
  var hist = drawHist(don);

  // console.log(don[5]);
  // Setup map data
  var mapSetup = function(donnees){
    // Creation canevas
    var canevas = d3.select('body')
      .append('svg')
      .attr('id', 'map')
      .attr('height', height / 2)
      .attr('width', width / 2.5 )
      .append('g')

    // Choix de projection
    const maProjection = d3.geoKavrayskiy7().scale(100).translate([220,160]);

    // la passer en paramètre du générateur de chemins
    const genererChemins = d3.geoPath().projection(maProjection);

    // ici, les données sont chargées
    const region_id = topojson.feature(donnees, donnees.objects.regionsPoly);

    var rectClickRstMap = canevas
      .append('rect')
        .attr('width', width / 2)
        .attr('height', height / 2)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('click', mapReset)

    var chemins = canevas.selectAll('path')
      .data(region_id.features)
      .enter()
      .append('path')
        .attr('class','feature')
        .attr('d', genererChemins)
        .on('click', mapClick);

    return canevas
  }

  //Running map
  var map = mapSetup(v[1]);

  // Making the network data from WeaponsDB
  var netwDataBuilder = function(d) {
    var nodes = [];
    var liens = [];

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



    for (i in partype){
      nodes.push({
        name: partype[i].key,
        degree: partype[i].value,
        type: 'category',
        class: partype[i].key
      })
    }

    //console.log(nodes);

    // parent weapons
    var parWeap = d.filter(d => d.name.includes('variants'));

    console.log(parWeap);

    for (i in parWeap){
      var strig = parWeap[i].name.match(/(\+)(\d+)/g)[0];

      var intstrig = parseInt(strig);

      nodes.push({
        name: parWeap[i].name,
        degree: intstrig,
        type: 'parent',
        class: parWeap[i].type
      })
    }

    //console.log(nodes);

    // variants
    var varWeap = d.filter(d => d.name.includes('- Variant of'))

    // console.log(varWeap);

    for (i in varWeap){
      nodes.push({
        name: varWeap[i].name,
        degree: 1,
        type: 'child',
        class: varWeap[i].type
      })
    }

  console.log(nodes);

    // Generer les liens


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
    return data;
  }

  // Drawing network
  var drawNetw = function(data){

    // Color scale nodes
    var echelleCouleur = d3.scaleOrdinal()
      .domain(['category', 'parent', 'child'])
      .range(['#d95f0e',  '#fec44f', '#fff7bc'])

    // size scale nodes
    var echelleTaille = d3.scaleLinear()
      .domain([1,57])
      .range([2,12])

    // Simple network:
    var svg = d3.select('body')
      .append('svg')
      .attr('height', height / 1.5)
      .attr('width', (width / 1.3))
      .attr('id', 'netw')
      .append('g')

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
        .attr('fill', d => echelleCouleur(d.type) )

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
  }

  // Running network
  var netwDons = netwDataBuilder(v[0]);
  var netw = drawNetw(netwDons);

  // Clicking
  function histClick(d) {

    if (active === d) return histReset();

    d3.select('#hist').selectAll(".active").classed('active', false);

    d3.select(this).classed('active', active = d);

    console.log(this);

    // interactivité avec réseau
    console.log(this.__data__.type);

    var newNodes = netwDons.nodes.filter(d =>
      d.class === this.__data__.type);

    console.log(newNodes);

    console.log(netwDons.links);

    var interLinks = netwDons.links.map(d => [d.source.name,
       d.source.class, d.target.name, d.target.class])

    var newLinks = interLinks.filter(d => d[3] === this.__data__.type)
        .map(d => ({
          source: d[0],
          target: d[2]
        }));

    var newNetwDat = {nodes: newNodes,links: newLinks};

    console.log(newNetwDat.nodes[0].degree)
    console.log(newNetwDat.nodes.map(d => d.degree));
    // Color scale nodes
    var echelleCouleur = d3.scaleOrdinal()
      .domain(['category', 'parent', 'child'])
      .range(['#d95f0e',  '#fec44f', '#fff7bc'])

    // size scale nodes
    var echelleTaille = d3.scaleLinear()
      .domain([1,d3.max(newNetwDat.nodes, d => d.degree)])
      .range([4,12])


// d3.select('#netw').select('g').selectAll("line").remove();
// d3.select('#netw').select('g').selectAll("circle").remove();


    // initialize links
    var link1 = d3.select('#netw')
    .select('g')
    .selectAll("line")
      .data(newNetwDat.links)
        .style("stroke", "#aaa")

    // Initialize the nodes
    var node = d3.select('#netw')
    .select('g')
    .selectAll("circle")
      .data(newNetwDat.nodes)
        .attr("r", d => echelleTaille(d.degree))
        .attr('class', 'nodes')
        .attr('fill', d => echelleCouleur(d.type) )

    d3.select('#netw')
    .select('g')
    .selectAll("circle")
    .data(newNetwDat.nodes)
      .exit()
      .remove();

    d3.select('#netw')
    .select('g')
    .selectAll("line")
    .data(newNetwDat.links)
      .exit()
      .remove();

    console.log(node,link1);

    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(newNetwDat.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
              .id(d => d.name)                     // This provide  the id of a node
              .links(newNetwDat.links)                                    // and this the list of links

        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 5, height /3))     // This force attracts nodes to the center of the svg area
        .on("end", ticked);

    function ticked() {
    link1
        .attr("x1", d => d.source.x )
        .attr("y1", d => d.source.y )
        .attr("x2", d => d.target.x )
        .attr("y2", d => d.target.y );

    node
         .attr("cx", d => d.x )
         .attr("cy", d => d.y );
    }
  }

  function mapClick(d) {
    if (active === d) return reset();

    var asd = d3.selectAll(".active").classed('active', false);

    d3.select(this).classed('active', active = d);

    var nomPoly = this.__data__.properties['FIPS'];

    var fips = ['BR', 'GL', 'GM', 'NH', 'BM', 'RO', 'NP', 'AC', 'MC', 'AJ', 'GH']

    var clickDon;

    fips.forEach(fip => {
      if (nomPoly == fip){
        switch (nomPoly) {
          case 'BR':
            clickDon = don.map( d => [d.type, d.southAmerica]);
            break;
          case 'GL':
            clickDon = don.map( d => [d.type, d.northAmerica]);
            break;
          case 'GM':
          clickDon = don.map( d => [d.type, d.westernEurope]);
            break;
          case 'NH':
          clickDon = don.map( d => [d.type, d.pacific]);
            break;
          case 'BM':
            clickDon = don.map( d => [d.type, d.southAsia]);
            break;
          case 'RO':
          clickDon = don.map( d => [d.type, d.easternEurope]);
            break;
          case 'NP':
          clickDon = don.map( d => [d.type, d.centralAsia]);
            break;
          case 'AC':
          clickDon = don.map( d => [d.type, d.centralAmerica]);
            break;
          case 'MC':
          clickDon = don.map( d => [d.type, d.eastAsia]);
            break;
          case 'AJ':
          clickDon = don.map( d => [d.type, d.middleEastNorthAfrica]);
            break;
          case 'GH':
          clickDon = don.map( d => [d.type, d.subSaharanAfrica]);
            break;
          default: clickDon = don.map( d => d.sum);
        }

        let echelleX = d3.scaleLinear()
             .domain([0,d3.max(clickDon, d => d[1])])
             .range([20, 500]);

        let updBarres = d3.selectAll('rect')
            .data(clickDon)
            .transition()
            .duration(200)
                .attr('x', 20)
                .attr('y', (d,i) => (i*24)+10)
                .attr('width', d => echelleX(d[1]))
                .attr('height', 19)
                .attr('fill', 'gray')
                //.attr('class', 'barres');

        d3.select('#hist').selectAll('text')
            .data(clickDon)
            .transition()
            .duration(200)
                .attr('x', d => echelleX(d[1])+30)
                .attr('y', (d,i) => (i*24)+23)
                .text(d => d[0])
                .attr('fill','white')
                .attr('class', 'labels')
                .attr('font-size', '10')

        let rmvAxe = d3.select('.axeX').remove();

        let ajoutNouvAxe = d3.select('#hist')
          .append('g')
          .classed('axeX', true)
          .attr('transform', 'translate(0,297)')
          .call(d3.axisBottom(echelleX));
      }
    })

  }

  // Reset
  function histReset() {
      d3.select('#hist').selectAll(".active").classed("active", active = false);
      d3.select('#hist').transition().duration(450).attr('transform','');
      console.log(this);
      hist;
  }
  function mapReset() {
    d3.select('#map').selectAll(".active").classed("active", active = false);
    d3.select('#map').selectAll(".active").transition().duration(750).attr('transform','');

    console.log('reset for map');

    echelleX = d3.scaleLinear()
        .domain([0,d3.max(don, d => d.sum)])
        .range([20, 500]);

    d3.select('#hist').selectAll('rect')
        .data(don)
        .transition()
        .duration(200)
            .attr('x', 20)
            .attr('y', (d,i) => (i*24)+10)
            .attr('width', d => echelleX(d.sum))
            .attr('height', 19)
            .attr('fill', 'gray')
            .attr('class', 'feature');

    d3.selectAll('text')
        .data(don)
        .transition()
        .duration(200)
            .attr('x', d => echelleX(d.sum)+30)
            .attr('y', (d,i) => (i*24)+23)
            .text(d => d.type)
            .attr('fill','white')
            .attr('class', 'labels')
            .attr('font-size', '10')

      d3.select('.axeX').remove();

      d3.select('#hist').append('g')
        .classed('axeX', true)
        .attr('transform', 'translate(0,297)')
        .call(d3.axisBottom(echelleX));

  }


});
