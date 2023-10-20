//The purpose of this code is to calculate the Win Loss elo of all teams
//by importing and looking through the tournament data


//import the tournament data
import data from '../esports-data/tournaments.json' assert { type: 'json' }

// sort function (sorts tournaments by oldest to newest)
function end_date_sort(a, b) {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
}

 // calling sort funct
 data.sort(end_date_sort);

 // creating teams array
let teams_arr = []


// going thorugh data and picking out data (win/loss)
 for (let i = 0; i < data.length ; i++) {
    for (let j = 0; j < data[i].stages.length ; j++) {
       for (let k = 0; k < data[i].stages[j].sections.length ; k++) {
           for (let l = 0; l < data[i].stages[j].sections[k].matches.length ; l++) {
                for (let m = 0; m < data[i].stages[j].sections[k].matches[l].games.length ; m++) {
                    if ((data[i].stages[j].sections[k].matches[l].games[m].teams[0].result != null) && (data[i].stages[j].sections[k].matches[l].games[m].teams[1].result != null)){
                        if (data[i].stages[j].sections[k].matches[l].games[m].teams[0].result.outcome != null){
                            // calling elo calculate with parameters
                            if (data[i].stages[j].sections[k].matches[l].games[m].teams[1].result.outcome != "forfeit"){
                            eloCalculate((data[i].stages[j].sections[k].matches[l].games[m].teams[0].result.outcome === "win" ? 1 : 0),
                             data[i].stages[j].sections[k].matches[l].games[m].teams[0].id, 
                             data[i].stages[j].sections[k].matches[l].games[m].teams[1].id,
                             data[i].stages[j].sections[k].matches[l].games[m].id,data[i].id) 
                            }                       
                        }
                       
                    }
               }
           }
       }
    }
}



// elo calculate function
function eloCalculate(metricOutcome_a, id_a, id_b, game_id,tournament_id) {
    
    // Assuming first match of a team before checking in the next few lines
    let team_a_ind = -1, team_b_ind = -1

    //finding the index of the teams involved in the match (if they have played before)
    teams_arr.find((val, index) => {
        if(val.team_id === id_a){
            team_a_ind = index
        }
    })
    teams_arr.find((val, index) => {
        if(val.team_id === id_b){
            team_b_ind = index
        }
    })
    
    // set defult values and create variables 
    let expectedMetricOutcome_a
    let expectedMetricOutcome_b
    let metricElo_a
    let metricElo_b
    let c = 400
    let k = 128 // changes as elo moves
    let metricEloGain_a 
    let metricEloGain_b

    //check if first game, and input starting elo. Otherwise find current elo
    if (team_a_ind === -1) {
        metricElo_a = 1000
    } else {
        metricElo_a = teams_arr[team_a_ind].current_elo
    }
    if (team_b_ind === -1) {
        metricElo_b = 1000
    } else {
        metricElo_b = teams_arr[team_b_ind].current_elo
    }
    

    // Changes the k values as elo increases or decreases 
    if ( metricElo_a >1300){
        k=32
    }
    if (metricElo_a>1600){
        k=16
    }
    if (metricElo_a>1800){
        k=4
    }
    if (metricElo_a<700){
        k=32
    }
    if (metricElo_a<400){
        k=16
    }
    if (metricElo_a<200){
        k=4
    }
    // Calc team a Elo
    expectedMetricOutcome_a = (10**(metricElo_a/c))/((10**(metricElo_a/c))+(10**(metricElo_b/c)))
    metricEloGain_a = k*(metricOutcome_a-expectedMetricOutcome_a)
    

    // Changes the k values as elo increases or decreases (for b)
    if (metricElo_b>1300){
        k=32
    }
    if (metricElo_b>1600){
        k=16
    }
    if (metricElo_b>1800){
        k=4
    }
    if (metricElo_b<700){
        k=32
    }
    if (metricElo_b<400){
        k=16
    }
    if (metricElo_b<200){
        k=4
    }

    // Calc team b
    expectedMetricOutcome_b = (10**(metricElo_b/c))/((10**(metricElo_b/c))+(10**(metricElo_a/c)))
    metricEloGain_b = k*((1-metricOutcome_a)-expectedMetricOutcome_b)

    //Update both a and b after elo is calculated
    metricElo_a+=metricEloGain_a
    metricElo_b+=metricEloGain_b

    // If first game create team object
    if (team_a_ind === -1){
        let x = {
            "team_id" : id_a,
            "current_elo" : metricElo_a,
            "history" : [
                {
                "game_id" : game_id,
                'tournament_id' : tournament_id,
                "elo_gained" : metricEloGain_a,
                "updated_elo" : metricElo_a,
                "opponent_id" : id_b
                }
            ]
        }
        //Add object to teams array
        teams_arr.push(x)

    } else {
        // Updates array if team a is not new
        teams_arr[team_a_ind].current_elo = metricElo_a
        teams_arr[team_a_ind].history.push({tournament_id: tournament_id, game_id: game_id,  elo_gained: metricEloGain_a,updated_elo: metricElo_a, opponent_id: id_b})
    }

    // If first game create team object
    if (team_b_ind === -1){
        let x = {
            "team_id" : id_b,
            "current_elo" : metricElo_b,
            "history" : [
                {
                "game_id" : game_id,
                'tournament_id' : tournament_id,
                "elo_gained" : metricEloGain_b,
                "updated_elo" : metricElo_b,
                "opponent_id" : id_b
                }
            ]
        }

        //Add object to teams array
        teams_arr.push(x)

    } else {
        // Updates array if team b is not new
        teams_arr[team_b_ind].current_elo = metricElo_b
        teams_arr[team_b_ind].history.push({tournament_id: tournament_id,game_id: game_id, elo_gained: metricEloGain_b, updated_elo: metricElo_b, opponent_id: id_a})
    }
}

// sort teams by elo
function teams_sort(a, b) {
    return (a.current_elo == b.current_elo ? 0 : (a.current_elo > b.current_elo ? 1 : -1))
}
 // calling sort function
 teams_arr.sort(teams_sort)



// We used the following code to get the last 20 games of all the teams to use in both the kills and gold elo calculations

// let game_id_arr = []
// for (let p = 0; p < teams_arr.length ; p++) {
//     for (let o = Math.max(0, teams_arr[p].history.length-20); o < teams_arr[p].history.length ; o++) { 
//         game_id_arr.push(teams_arr[p].history[o].game_id)
//     }
// }
// let search
// for (let one =0; one<game_id_arr.length; one++){
//     search = game_id_arr[one]
//     for (let two =0; two<game_id_arr.length; two++){
//       if ((search == game_id_arr[two]) && (one !=two))
//         game_id_arr.splice(two,1)
//     }
// }
//console.log(JSON.stringify(game_id_arr))


//Print json object.
console.log(JSON.stringify(teams_arr,null,4))

//We ran the code in terminal by running node eloGen.js > wlElo.json