import { Facility } from '@/app/types/facility';

export const facilities: Facility[] = [
  {
    id: '1',
    name: '독서실',
    description: '조용하고 쾌적한 학습 공간입니다.',
    category: '학습시설',
    capacity: 50,
    operatingHours: '24시간',
    pricePerHour: 3000,
    imageUrl: 'https://via.placeholder.com/600x400', // Placeholder
    rooms: [
      { id: 'r1', name: '일반열람실', capacity: 30, pricePerHour: 2000 },
      { id: 'r2', name: '스터디룸 A', capacity: 10, pricePerHour: 5000 },
      { id: 'r3', name: '스터디룸 B', capacity: 10, pricePerHour: 5000 },
    ],
  },
];
