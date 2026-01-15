import { Component, OnInit } from '@angular/core';
import { DataService } from '../data';

interface Team {
  name: string;
  players: any[];
}

@Component({
  selector: 'app-cricket',
  standalone: false,
  templateUrl: './cricket.html',
  styleUrl: './cricket.css',
})
export class Cricket implements OnInit {
  allCricketPlayers: any[] = []; 
  cricketPlayers: any[] = [];    
  teams: Team[] = [];         
  newTeamName: string = '';
  fixtures: any[] = [];       
  nameColumn: string = ''; 
  selectedCategory: string = 'all'; 

  // Winners aur Losers track karne ke liye state
  matchResults: any = {
    1: { winner: null, loser: null },
    2: { winner: null, loser: null },
    3: { winner: null, loser: null },
    4: { winner: null, loser: null },
    5: { winner: null, loser: null }
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.currentData.subscribe(data => {
      if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        this.nameColumn = keys.find(k => k.toLowerCase().includes('full name')) || keys[1];

        this.allCricketPlayers = data.filter(row => {
          return Object.values(row).some(val => 
            String(val).toLowerCase().includes('cricket')
          );
        });
        this.applyCategoryFilter(); 
      }
    });
  }

  applyCategoryFilter(): void {
    if (this.selectedCategory === 'all') {
      this.cricketPlayers = [...this.allCricketPlayers];
    } else {
      this.cricketPlayers = this.allCricketPlayers.filter(row => {
        const rowKeys = Object.keys(row);
        const categoryKey = rowKeys.find(k => {
          const keyLower = k.toLowerCase();
          if (this.selectedCategory === 'male') {
             return keyLower.includes('which games') && keyLower.includes('male') && !keyLower.includes('female');
          }
          if (this.selectedCategory === 'kids') {
             return keyLower.includes('which games') && (keyLower.includes('kids') || keyLower.includes('children'));
          }
          return keyLower.includes('which games') && keyLower.includes(this.selectedCategory);
        });
        if (categoryKey) {
          const val = String(row[categoryKey]).toLowerCase();
          return val !== '' && !val.includes('none');
        }
        return false;
      });
    }
    const assignedPlayerNames = this.teams.flatMap(t => t.players.map(p => p[this.nameColumn]));
    this.cricketPlayers = this.cricketPlayers.filter(p => !assignedPlayerNames.includes(p[this.nameColumn]));
  }

  addTeam(): void {
    if (this.newTeamName.trim()) {
      this.teams.push({ name: this.newTeamName, players: [] });
      this.newTeamName = '';
    }
  }

  assignToTeam(player: any, teamIndex: number): void {
    this.teams[teamIndex].players.push(player);
    this.applyCategoryFilter();
  }

  removeFromTeam(player: any, teamIndex: number): void {
    this.teams[teamIndex].players = this.teams[teamIndex].players.filter(p => p !== player);
    this.applyCategoryFilter();
  }

  // Winner select karne par agle matches update karne ka function
  updateMatchWinner(matchId: number, winnerName: string): void {
    const match = this.fixtures.find(f => f.id === matchId);
    if (!match) return;

    const loserName = (winnerName === match.team1) ? match.team2 : match.team1;
    
    // Result save karo
    this.matchResults[matchId] = { winner: winnerName, loser: loserName };
    
    // Fixtures refresh karo taaki teams aage badhein
    this.generateFixtures();
  }

  generateFixtures(): void {
    if (this.teams.length < 4) {
      alert("Bhai, is format ke liye kam se kam 4 teams chahiye!");
      return;
    }

    const res = this.matchResults;

    this.fixtures = [
      { 
        id: 1, match: 'Match 1', type: 'Qualifier',
        team1: this.teams[0].name, team2: this.teams[1].name,
        winner: res[1].winner 
      },
      { 
        id: 2, match: 'Match 2', type: 'Qualifier',
        team1: this.teams[2].name, team2: this.teams[3].name,
        winner: res[2].winner 
      },
      { 
        id: 3, match: 'Match 3', type: 'Eliminator',
        team1: res[1].loser || 'Loser of Match 1', 
        team2: res[2].loser || 'Loser of Match 2',
        winner: res[3].winner 
      },
      { 
        id: 4, match: 'Match 4', type: 'Semi-Final',
        team1: res[1].winner || 'Winner of Match 1', 
        team2: res[2].winner || 'Winner of Match 2',
        winner: res[4].winner 
      },
      { 
        id: 5, match: 'Match 5', type: 'GRAND FINAL',
        team1: res[3].winner || 'Winner of Match 3', 
        team2: res[4].winner || 'Winner of Match 4',
        winner: res[5].winner 
      }
    ];
  }
}