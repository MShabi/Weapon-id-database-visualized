# Weapons visualized across the world

## Description
This web visualisation is base on the Weapons ID database provided by [Small Arms Survey](http://www.smallarmssurvey.org).

## Weapons ID Database
[Database](http://www.smallarmssurvey.org/weapons-and-markets/tools/weapons-id-database.html)

*In response to growing demand for small arms identification resources, the Survey redesigned its Small Arms ID Cards into a comprehensive visual identification system. This database was developed with the support of the Royal Armouries UK, and features downloadable Weapons ID Sheets, which detail the visual information required to accurately identify and record particular types of weapons. With well over 30 varieties and copies of the original Kalashnikov assault rifle alone, this database is a valuable tool for any practitioners working in the field of small arms.* (Small Arms Survey)

![Weapond ID Database screenshot](/figures/weapIdDb.png)

## Tools used
<a href="https://d3js.org"><img src="https://d3js.org/logo.svg" align="left" hspace="10" vspace="6"></a>
Use of the node library pupeteer allowed to extraction of data from the web (scrapping)
<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" height="200" align="right">
Use of [d3.js](https://d3js.org/) allowed visualisations of different types (bar-plot, map and network) to be generated on the weapons categories distibuted around the world.



## Data
Each entrie of the Database represents a model of a weapon. It can either be a parent model, meaning it contains variants, or a variant model, meaning it contains a father model.
The information provided for each entry is: `Type`, `Name`, `Calibre`, `Distribution`, `Features`, `PDF`. This visualisation only takes into account `Type`, `Name`, and `Distribution`.

`Type` is separated in 12 different categories of weapons:

- Pistol
- Stand-Alone Grenade Launcher
- Assault Rifle
- General Purpose Machine Gun
- Anti-Materiel Rifle
- Sub-machine Gun
- Rifle
- Sniper Rifle
- Recoilless Gun
- Rocket Launcher
- Under-Barrel Grenade Launcher
- Heavy Machine Gun

`Name` is unique for each entrie.

`Distribution` contains the regions in which the weapon in question is distributed. The possibilities are:

- Western Europe
- Eastern Europe
- Middle East & North Africa
- Sub-Saharan Africa
- Central Asia
- South Asia
- East Asia
- Pacific
- North America
- Central America
- South America

## Interface
Interface is composed by tree elements: a barplot, a map and a network. 

**Barplot**: Practically a histogram of the number of weapons by type. On initiation the values showed are world values (how many weapons by type in the whole world). However, the values change as regions on the map are selected in which case the values shown belong to that region.

For example, if you click on South America, the barplot will update to show you the data for that region.

![capture](/figures/histExplained.png)

**Map**: Works as a filter for the barplot as well as its reset. When mouse hovers over a region, it changes color. On click, the barplot will be modified and to reset back to the original you must click in the ocean.

![polygons](/figures/mapHover.png)

**Network**: A network of the weapons. It can be filtered by selecting a type of weapon directly on the histogram. However it will only work if the world data is loaded on the barplot (no regions on the map must be selected).
![network](/figures/weapons_network.png)

## Use
Given that this project is not yet hosted on a server, to visualize it you must run in locally. There are various ways of achieving this goal but below is a step-by-step explenation of how to locally run a server using python3.

**Windows**

1. Download zip, extract them into a folder.
2. Open a new Command Prompt, set the working directory to the folder.
ex : cd /Users/username/Desktop/Titre
3. Initiate a server with python by entering:
`python3 -m http.server`
4. Command Prompt should display: `Serving HTTP on 0.0.0.0 port 8000`
5. Open a browser and enter the adress: `http://0.0.0.0:8000/`

**MacOs**

Same as Windows but using Terminal.

## Updating data
An effort was made with this project to create a visualisation that can withstand changes made to the the original data. The script `weapscrap.js` fetches the data and saves is as `WeaponsDB.json` locally. This manipulation can be done every few months in oder to have the latest version of the database.

### About Small Arms Survey:
*The Small Arms Survey provides expertise on all aspects of small arms and armed violence.*

*As a global centre of excellence, the Small Arms Survey generates evidence-based, impartial, and policy-relevant knowledge and analysis on small arms and armed violence issues for governments, policy-makers, researchers, and civil society. The Survey is a project of the Graduate Institute of International and Development Studies in Geneva, Switzerland.*

*The Survey has an international staff with expertise in security studies, political science, law, economics, development studies, sociology, and criminology. About half of the Survey’s team is based in Geneva. The Survey also has an office in Washington DC.* (Small Arms Survey)

## Autors
All work preset here was made by Nicolas Rojas & Maxime Shabi as evaluation for "Visualisation de données", a master class by prof. Isaac Pante at University of Lausanne - Spring 2019.

## Acknolegements
Mike Bostock for D3 and all the examples.
Isaac Pante for the leasons.
The JS community for helping eachother.

