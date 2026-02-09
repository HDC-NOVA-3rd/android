export interface Room {
  id: string;
  name: string;
  maxCapacity: number;
  minCapacity: number;
  pricePerHour: number;
}

export interface Facility {
  facilityId: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  operatingHours: string;
  imageUrl: string;
  rooms: Room[];
}
