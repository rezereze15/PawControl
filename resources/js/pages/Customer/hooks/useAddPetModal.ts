import { useState } from "react"

export function useAddPetModal() {
  const [showAddPet, setShowAddPet] = useState(false)

  return { showAddPet, setShowAddPet }
}
