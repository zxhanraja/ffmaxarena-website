import { Database } from './database.types';

export type Tournament = Database['public']['Tables']['tournaments']['Row'];
export type Organizer = Database['public']['Tables']['organizers']['Row'];
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update'];
export type OrganizerInsert = Database['public']['Tables']['organizers']['Insert'];
export type OrganizerUpdate = Database['public']['Tables']['organizers']['Update'];