//The purpose of the following code is to download the games pulled from the 
//eloGen.js code. (The code I'm refering to is commented out). This is over 7000 games. 
//Once each game is downloaded, it is looked through to find the total Gold of each team
// and the total kills of each team. Also the team ids are saved as well. 
//Once all useful data is found, the file is deleted.


//Import stuff :)
import fetch from 'node-fetch';
import fs from 'fs';
import zlib from 'zlib';
import stream from 'stream';
import util from 'util';


//Import the games_ids that will be downloaded.
import data from './esports-data/games_id.json' assert { type: 'json' }
//Import the mapping data proveided by Riot.
import mapping from './esports-data/mapping_data.json' assert { type: 'json' }



const pipeline = util.promisify(stream.pipeline);


//URL provided by Riot
const S3_BUCKET_URL = "https://power-rankings-dataset-gprhack.s3.us-west-2.amazonaws.com";


//This file will dowload the game_id from game_id.json. It will also pull the data that we need.
export async function downloadGzipAndWriteToJson(fileName, hund, two_hund, plat_id) {
   
    // Get server response on the file we are requesting
    const response = await fetch(`${S3_BUCKET_URL}/${fileName}.json.gz`);

// If all good, proceed
    if (response.status === 200) {
        try {

            // Download the file
            const gzipStream =  await response.body.pipe(zlib.createGunzip());
            const jsonFile = `${fileName}.json`;
            await pipeline(gzipStream, fs.createWriteStream(`${fileName}.json`));

            //Allows reading of file 
            const jsonData = await fs.readFileSync(jsonFile);

            //Parsed data is set to the variable, game.
            const game = JSON.parse(jsonData);


            // Creating variables that will be used to hold data of the game
            // ie gold, kills, deaths...
            let totalGold_a
            let kills_a
            let deaths_a
            let totalGold_b
            let kills_b
            let deaths_b
            let deltaGold_a 
            let deltaGold_b 
            let deltaKills_a
            let deltaKills_b

            //Loops backwards through eventTypes within the game that was just downloaded
            for (let x= game.length-1; x > 0; x--){

                // If a stats_update eventType is found then pull the data needed.
                if (game[x].eventType == 'stats_update'){
                 totalGold_a = game[x].teams[0].totalGold
                 kills_a = game[x].teams[0].championsKills
                 deaths_a = game[x].teams[0].deaths
                
                 totalGold_b = game[x].teams[1].totalGold
                 kills_b = game[x].teams[1].championsKills
                 deaths_b = game[x].teams[1].deaths

                 // Calculate delta(differences) values for each team based on their perspective
                 deltaGold_a = totalGold_a - totalGold_b
                 deltaKills_a = kills_a - kills_b
                 deltaGold_b = totalGold_b - totalGold_a
                 deltaKills_b = kills_b - kills_a
                 //Since we only want the last stats of the game we break after this 
                 break
                 }
             }

             // Creates js object of the data we just pulled
             let gameRead = {
                "plat_id" : plat_id,
                "teams" : [
                    {
                    "team_id" : hund,
                    "totalGold" : totalGold_a,
                    "kills" : kills_a,
                    "deaths" : deaths_a,
                    "deltaGold" : deltaGold_a,
                    "deltaKils" : deltaKills_a, 
                    },
                    {
                    "team_id" : two_hund,
                    "totalGold" : totalGold_b,
                    "kills" : kills_b,
                    "deaths" : deaths_b,
                    "deltaGold" : deltaGold_b,
                    "deltaKils" : deltaKills_b, 
                    }
                ]
            }
            // returns that data in terms of js object
          return gameRead

          // if error happens, displayes error
        } catch (e) {
            console.error("Error:", e);
        }
        // If file fails to download show servers response
    } else {
        console.log(`Failed to download ${fileName}`, response.status);
    }
}

// we need an array of platform_game_ids becuase 
// our input is in the form of game_ids
let plat_id = []

// array of team ids of the 100 and 200 teams for our matches 
let hund = []
let two_hund = []


let l = data.length
let found

// This loop goes through and adds platform_game_ids to plat_id array
// We need to do this because the downloads are in terms of 
// platform_game_id not game_id
for (let x = 0; x < l; x++){
    found = mapping.find((val) => {
        if (val.esportsGameId == data[x]) return true
    })

    // not all games exist in mapping file per Riot
    if(found != undefined) {
        plat_id.push(found.platformGameId)
        //Adds the teams to 100 and 200 for the given match
        //This is used when pulling the data in the download function
        hund.push(found.teamMapping[100])
        two_hund.push(found.teamMapping[200])
    } else {
    }
} 

//newGameData is going to hold what the download function outsputs
let newGameData

// Runs throgh all platfrom_game_ids and runs the downloads function for each one
for (let y = 0 ; y < plat_id.length; y++){

    //calls function and return result is set to newGameData
    newGameData = await downloadGzipAndWriteToJson( `games/${plat_id[y]}`,hund[y],two_hund[y],plat_id[y])
       
        //Deletes file after download and data pull 
        fs.unlink(`games/${plat_id[y]}.json`, (err) => {
        if (err) {
             throw err;
       }
    });

//Prints each game data pull right after it deletes. 
//After script completes it can be easily edited to an array of objects
console.log(JSON.stringify(newGameData,null,4) + ',')
}


//We run this script in termianl by node gamedatapull.js > statsData.json
//This script takes a long time to run over 7 hours
