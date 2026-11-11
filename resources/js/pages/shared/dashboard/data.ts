import { sionPhoto, leanPhoto, bincentPhoto, johnPhoto, moyPhoto, giyoPhoto } from './assets';

export const MOCK_PATIENTS = [
  {
    id: 1,
    name: "Sion",
    breed: "Poodle",
    age: 5,
    status: "On Going",
    photo: sionPhoto,
  },
  {
    id: 2,
    name: "Lean",
    breed: "Aspin",
    age: 3,
    status: "Up Coming",
    photo: leanPhoto,
  },
  {
    id: 3,
    name: "Bincent",
    breed: "Oriental Shorthair",
    age: 1,
    status: "Up Coming",
    photo: bincentPhoto,
  },
  {
    id: 4,
    name: "John A.",
    breed: "Newfoundland",
    age: 7,
    status: "Up Coming",
    photo: johnPhoto,
  },
]

export const NEXT_APPOINTMENTS = [
  {
    id: 1,
    name: "Moy",
    breed: "Exotic Shorthair",
    date: "May 16, 2026 (Friday)",
    time: "11:00 AM",
    photo: moyPhoto,
  },
  {
    id: 2,
    name: "Giyo",
    breed: "Calico",
    date: "May 16, 2026 (Friday)",
    time: "12:00 PM",
    photo: giyoPhoto,
  },
]
