export interface EventData {
    _id: string;
    title: string;
    description: string;
    price: number;
    date: string;
    image: string;
    participants: string[];
    guestParticipants: Array<{ name: string, email: string, mainParticipant: string }>
  }
  