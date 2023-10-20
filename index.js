import express from 'express'
import rankings from './finalElo.json' assert { type:'json' }
import teams from './esports-data/teams.json' assert { type: 'json' }
import tournaments from './esports-data/tournaments.json' assert { type: 'json' }

rankings.sort( (a, b) => b.current_elo - a.current_elo )

let elo_rankings = []
rankings.forEach((val, i) => {
    let team = teams.find((v) => {
        if(v.team_id == val.team_id) return true 
    })
    if(team != null) elo_rankings.push({team_id: val.team_id, team_code: team.acronym, team_name: team.name, current_elo: val.current_elo, rank: i + 1})
})

const app = express()

app.use(express.json())

app.get('/global_rankings', (req, res) => {
    res.send(JSON.stringify(elo_rankings.slice(0, req.query.number_of_teams)))
})

const teams_ranking = (team_ids, tournament_id) => {
    let response = []
    if (tournament_id == null) {
        team_ids.forEach((team_id_search) => {
            let team = elo_rankings.find((v) => {
                if (v.team_id == team_id_search) return true
            })
            if (team != null) response.push(team)
        })

    } else {
        team_ids.forEach((team_id_search) => {
            let team = elo_rankings.find((v) => {
                if (v.team_id == team_id_search) return true
            })
            let history = rankings.find((v) => {
                if (v.team_id == team_id_search) return true
            }).history
            history.find((team_history) => {
               if(team_history.tournament_id == tournament_id) {
                    team.current_elo = team_history.updated_elo - team_history.elo_gained
                    // console.log(team_history)
                    return true
               }
            })
            response.push(team)
        })
    }
    response.sort((b, a) => a.current_elo - b.current_elo)
    response.forEach((v, i) => {
        v.rank = i + 1
    })
    return response
}

app.get('/team_rankings', (req, res) => {
    res.send(teams_ranking(req.query.team_ids))   
})

app.get('/tournament_rankings/:id', (req, res) => {
    let team_ids = new Set()

    let tournament = tournaments.find((tournament) => {
        if (tournament.id == req.params.id) return true
    })

    // console.log(req.params.id)

    if(tournament != null) {
        tournament.stages.forEach((stage) => {
            stage.sections.forEach((section) => {
                section.matches.forEach((match) => {
                    match.teams.forEach((team) => {
                        team_ids.add(team.id)
                    })
                })
            })
        })
        // console.log(teams)
        res.send(teams_ranking(team_ids, req.params.id))
    } else {
        res.send("Error: Tournament not found")
    }
})

app.listen(5001, () => {
    console.log('The server is running on port 5001.')
})