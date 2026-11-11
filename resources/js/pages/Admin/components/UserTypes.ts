import { asaPhoto, chaewonPhoto, leanPhoto, maloiPhoto } from "../../shared/dashboard/assets"

export type UserRole = "Admin" | "Clerk" | "Veterinarian" | "Customer"
export type UserStatus = "Active" | "Inactive"
export interface UserRow {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  lastLoginTime: string
  photo: string
}

export const MOCK_USERS: UserRow[] = [
  {
    id: "UID-0001",
    name: "Chaewon",
    email: "chaeown@gmail.com",
    role: "Admin",
    status: "Active",
    lastLogin: "April 25, 2026",
    lastLoginTime: "12:20 AM",
    photo: chaewonPhoto,
  },
  {
    id: "UID-0002",
    name: "Maloi",
    email: "maloi2@gmail.com",
    role: "Clerk",
    status: "Active",
    lastLogin: "April 25, 2026",
    lastLoginTime: "11:02 AM",
    photo: maloiPhoto,
  },
  {
    id: "UID-0003",
    name: "Haerin",
    email: "hayrin01@gmail.com",
    role: "Veterinarian",
    status: "Active",
    lastLogin: "April 25, 2026",
    lastLoginTime: "11:30 AM",
    photo: leanPhoto,
  },
  {
    id: "UID-0004",
    name: "Asa",
    email: "asababy@gmail.com",
    role: "Veterinarian",
    status: "Inactive",
    lastLogin: "April 25, 2025",
    lastLoginTime: "11:00 AM",
    photo: asaPhoto,
  },
]