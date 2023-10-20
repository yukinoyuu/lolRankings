//The purpose of the following code is 
//to take the 3 distinct elos we calculate for the teams
// and combine them into one


// import our three different elo files 
import kill from '../JSON-Outputs/killElo.json' assert {type:'json'}
import gold from '../JSON-Outputs/goldElo.json' assert {type:'json'}
import wl from '../JSON-Outputs/wlElo.json' assert {type:'json'}


// Adds 30 percent of the kills elo to final elo
for (let x =0; x < kill.length; x++){
    if (kill[x].team_id != null) {
        wl.find((val) => {
            if(val.team_id == kill[x].team_id){
                val.current_elo += ((kill[x].current_elo)*.30)
            }
        })    
    }
}   
// Adds 20 percent of the gold elo to final elo

for (let x =0; x < gold.length; x++){
    if (gold[x].team_id != null) {
        wl.find((val) => {
            if(val.team_id == gold[x].team_id){
                val.current_elo += ((gold[x].current_elo)*.20)
            }
        })    
    }
}   
//sorts elo by lowest to highest
function teams_sort(a, b) {
    return (a.current_elo == b.current_elo ? 0 : (a.current_elo > b.current_elo ? 1 : -1))
}
 // calling sort funct
 wl.sort(teams_sort)


// prints to console (then we run it in terminal by doing node combineElo.js > finalElo.json)
console.log(JSON.stringify(wl,null,4))
