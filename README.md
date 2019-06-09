# Weapons visualized across the world

## Description

This application is base on the Database provided by [Small Arms Survey](http://www.smallarmssurvey.org/weapons-and-markets/tools/weapons-id-database.html).
*The Small Arms Survey provides expertise on all aspects of small arms and armed violence.*

*As a global centre of excellence, the Small Arms Survey generates evidence-based, impartial, and policy-relevant knowledge and analysis on small arms and armed violence issues for governments, policy-makers, researchers, and civil society. The Survey is a project of the Graduate Institute of International and Development Studies in Geneva, Switzerland.*

*The Survey has an international staff with expertise in security studies, political science, law, economics, development studies, sociology, and criminology. About half of the Survey’s team is based in Geneva. The Survey also has an office in Washington DC.* (Small Arms Survey)

Use of [d3.js](https://d3js.org/) allowed multiple visualisations to be generated on the weapons categories distibuted around the world.

## The Weapons ID Database
[DATABASE-LINK](http://www.smallarmssurvey.org/weapons-and-markets/tools/weapons-id-database.html)

*In response to growing demand for small arms identification resources, the Survey redesigned its Small Arms ID Cards into a comprehensive visual identification system. This database was developed with the support of the Royal Armouries UK, and features downloadable Weapons ID Sheets, which detail the visual information required to accurately identify and record particular types of weapons. With well over 30 varieties and copies of the original Kalashnikov assault rifle alone, this database is a valuable tool for any practitioners working in the field of small arms.* (Small Arms Survey)

## Interface

Interface is composed by tree elements: a network, a map and a barplot. The data represent 12 different categories of weapons and their variants across the world.

**The network** show the links between the different weapons classes and their variants.

**The map** show the different region of the world. 
```
Selection of a region will generate a barplot showing the proportion of each weapon category in it.
```
**The Barplot** show the repartition of weapon type and quantities of variants in each type.

## Use

How to run the visualisation :

**Windows**

1. Download files , extract them into a file.
2. Open a new Command Prompt, enter the working directory.
ex : cd /Users/username/Desktop/Titre
3. Initiate a server with python by entering:
`python3 -m http.server`
4. Command Prompt should display: Serving HTTP on 0.0.0.0 port 8000
5. Open a browser and enter the adress: `127.0.0.1:8000`

**MacOs**

1. Download files , extract them into a file.
2. Open a new Terminal, enter working directory
ex : cd /Users/username/Desktop/Titre
3. Initiate a server with python by entering:
	`python3 -m http.server`
4. Command Prompt should display: Serving HTTP on 0.0.0.0 port 8000
5. Open a browser and enter the adress: `127.0.0.1:8000`

Data can be updated from source by running webscrap.js code with the puppeteer node package.

## Autors

Those visualisations were made by Nicolas Rojas & Maxime Shabi during the "Visualisation de données" master class from prof. Isaac Pante at University of Lausanne - Spring 2019.

