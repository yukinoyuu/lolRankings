// The purpose of the following code is to calculate the elo for both delta(differences) gold and kills
// It takes in the output of the gamedatapull.js (statsData) 
// From this input it calculates the elo


//Import 
import stats from '../statsData.json' assert { type: 'json' }
import mapping from '../esports-data/mapping_data.json' assert { type: 'json' }
import tournament from '../esports-data/tournaments.json' assert { type: 'json' }
// for (let r = 0; r < stats.length; r++){
// console.log(stats[r].teams[1].team_id)
// console.log(stats[r].teams[0].team_id)
// }
//Sort Array to get game_id
let found
for (let z = 0; z < stats.length; z++){
    found = mapping.find((val) => {
        if (val.platformGameId == stats[z].plat_id) return true
    })
    if(found != undefined) {
        stats[z].game_id = found.esportsGameId
    } else {
        console.log('error1') 
        break
   }
   
} 
//Sort Array to get dates

for (let x = 0; x < stats.length; x++){
    for (let l = 0; l < tournament.length; l++){
    for (let j = 0; j < tournament[l].stages.length; j++){
    for (let k =0; k < tournament[l].stages[j].sections.length; k++){
        for (let g = 0; g < tournament[l].stages[j].sections[k].matches.length; g++){ 
            for (let f = 0; f < tournament[l].stages[j].sections[k].matches[g].games.length; f++){
    if( tournament[l].stages[j].sections[k].matches[g].games[f].id == stats[x].game_id){
        stats[x].endDate = tournament[l].endDate
    }
   
}}}}}}
function end_date_sort(a, b) {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
}

 // calling sort funct
 stats.sort(end_date_sort);




let teams_arr = []
let one = ''
let two = ''
let metric_one = 0
let metric_two = 0
let deltaMetric_one = 0;
let deltaAC = 0
let deltaMetric_two = 0;
let game_id = 0;

for (let x = 0; x < stats.length; x++){
    one = stats[x].teams[0].team_id
    two = stats[x].teams[1].team_id
    metric_one = stats[x].teams[0].kills
    metric_two = stats[x].teams[1].kills
    deltaMetric_one = stats[x].teams[0].deltaKils
    deltaMetric_two = stats[x].teams[1].deltaKils
    game_id = stats[x].game_id
    if ( deltaMetric_one >= 0 ){
        deltaAC = ((deltaMetric_one)/(metric_one))**0.7
        eloCalculate(deltaAC,one,two,game_id)
    }
    else if (deltaMetric_two>=0){
        deltaAC = ((deltaMetric_two)/(metric_two))**0.7
        console.log(deltaAC)
        eloCalculate(deltaAC,two,one,game_id)
    }
}


// elo calculate function
function eloCalculate(metricOutcome_a, id_a, id_b, game_id) {
    
    let team_a_ind = -1, team_b_ind = -1
    teams_arr.find((val, index) => {
        if(val.team_id == id_a){
            team_a_ind = index
        }
    })
    teams_arr.find((val, index) => {
        if(val.team_id == id_b){
            team_b_ind = index
        }
    })
    
    // set defult values
    let expectedMetricOutcome_a
    let expectedMetricOutcome_b
    let metricElo_a
    let metricElo_b
    let c = 1200
    let k = 200 // change to 16 when eslo is high
    let metricEloGain_a 
    let metricEloGain_b
    //check if first game, and input starting elo
    if (team_a_ind == -1) {
        metricElo_a = 1000
    } else {
        metricElo_a = teams_arr[team_a_ind].current_elo
    }
    if (team_b_ind == -1) {
        metricElo_b = 1000
    } else {
        metricElo_b = teams_arr[team_b_ind].current_elo
    }
    

    // Calc team a

    
    expectedMetricOutcome_a = (10**(metricElo_a/c))/((10**(metricElo_a/c))+(10**(metricElo_b/c)))
    metricEloGain_a = k*(metricOutcome_a-expectedMetricOutcome_a)
    
    // Calc team b
   
    expectedMetricOutcome_b = (10**(metricElo_b/c))/((10**(metricElo_b/c))+(10**(metricElo_a/c)))
    metricEloGain_b = k*((1-metricOutcome_a)-expectedMetricOutcome_b)
    //Update both a and b
    metricElo_a+=metricEloGain_a
    metricElo_b+=metricEloGain_b

    if (team_a_ind == -1){
        // burh create it team a
        let x = {
            "team_id" : id_a,
            "current_elo" : metricElo_a
        }
        teams_arr.push(x)
    } else {
        // bruh update it team a
        teams_arr[team_a_ind].current_elo = metricElo_a
        teams_arr[team_a_ind].team_id= id_a

    }

    if (team_b_ind == -1){
        // burh create it team b
        let x = {
            "team_id" : id_b,
            "current_elo" : metricElo_b
            
        }
        teams_arr.push(x)
    } else {
        // bruh update it team b
        teams_arr[team_b_ind].current_elo = metricElo_b
        teams_arr[team_b_ind].team_id= id_b

    }
    //console.log(metricElo_a)
}

// sort function
function teams_sort(a, b) {
    return (a.current_elo == b.current_elo ? 0 : (a.current_elo > b.current_elo ? 1 : -1))
}
 // calling sort funct
 teams_arr.sort(teams_sort)

console.log(JSON.stringify(teams_arr,null,4))
// teams_arr.forEach((val) => {
//    console.log(`team_id:${val.team_id}, elo:${val.current_elo}`)
//  })