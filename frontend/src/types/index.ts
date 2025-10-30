export interface User {
  id: string;
  email: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  bio?: string;
  location?: string;
  photos: string[];
  interests: string[];
  preferredGender: string[];
  preferredAgeMin: number;
  preferredAgeMax: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  matchId: string;
  user: User;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: User;
}

export interface DiscoverUser extends Profile {
  user: {
    id: string;
    email: string;
  };
  matchScore?: number;
}
