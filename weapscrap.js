const puppeteer = require('puppeteer')

void (async () => {
  try {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto('http://sasweaponsid.roadmapmedia.ch/')

    // grab weapon data
    const weaps = await page.evaluate(() => {

      // a helper function for some slight code reuse
      // grab the TD, the text and remove trailing whitespace
      // What if there is no class name...?
      /*const grabFromRow = (row, index) => row
        .querySelectorAll(`td${[index]}`)
        .innerText
        .trim()*/

      const grabFromList = (node, index) => node
        .children[index]
        .innerText
        .trim();

      const SELECTEUR = ['tr.parent-weapon', 'tr.child-weapon']
      // we'll store our data in an array of objects
      const data = []
      // get all team rows
      const weaponList = document.querySelectorAll(SELECTEUR);

      // const weaponList = document.querySelectorAll(['tr.parent-weapon', 'tr.child-weapon'])

      console.log(weaponList);

      console.log('Before loop!');

      // loop over each team row, creating objects
      for (const weapon of weaponList) {

        data.push({
          type : grabFromList(weapon, 0),
          name : grabFromList(weapon, 1),
          calibre : grabFromList(weapon, 2),
          regions : grabFromList(weapon, 3)

        })


        /*data.push({
          type : grabFromRow(wr, 0),
          name: grabFromRow(wr, 1),
          calibre: grabFromRow(wr, 2),
          regions: grabFromRow(wr, 3)
        })*/
      }
      // send the data back into the teams variable
      return data
    })



    // sauvegarder en JSON
    const fs = require('fs');
    fs.writeFile(
        'WeaponsDB.json',
        JSON.stringify(weaps, null, 2),
        (err) => err ? console.error('Data non écrite!', err) : console.log('Données inscrites!')
    )


    await browser.close()
  } catch (error) {
    console.log(error)
  }
})()
