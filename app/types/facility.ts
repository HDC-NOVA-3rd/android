export interface Room {
  id: string;
  name: string;
  capacity: number;
  pricePerHour: number;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  operatingHours: string;
  pricePerHour: number;
  imageUrl: string;
  rooms: Room[];
}
