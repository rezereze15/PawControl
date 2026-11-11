import { useState } from "react"

export function useAppointmentPetSelection() {
  const [selected, setSelected] = useState<string | null>("Lean")
  const [showAddPet, setShowAddPet] = useState(false)
  return { selected, setSelected, showAddPet, setShowAddPet }
}
