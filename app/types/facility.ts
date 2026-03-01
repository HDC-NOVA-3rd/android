export interface Space {
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
  capacity: string;
  operatingHours: string;
  imageUrls: string[];
  spaces: Space[];
  reservationAvailable?: boolean;
}
