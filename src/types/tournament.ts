export interface TournamentOrganizer {
  name: string;
  slug: string;
  logoUrl: string;
}

export interface TournamentMatchTeam {
  name: string;
}

export interface TournamentMatch {
  name: string;
  slug: string;
  teams: TournamentMatchTeam[];
  dateTime: string;
  location: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  organizer: TournamentOrganizer;
  matches: TournamentMatch[];
}
