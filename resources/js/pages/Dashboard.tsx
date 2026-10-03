import { useState, type ReactNode } from 'react';
import bigpawLogo from '../imports/Bigpaw_logoname-removebg-preview.png';
import pawLogo from '../imports/pawlogo.png';
import leanPhoto from '../imports/lean.png';
import qrCode from '../imports/image-8.png';
import sionPhoto from '../imports/sion.png';
import bincentPhoto from '../imports/bincent.png';
import johnPhoto from '../imports/John_A..png';
import moyPhoto from '../imports/moy.png';
import giyoPhoto from '../imports/giyo.png';
import haerinPhoto from '../imports/haerin.png';
import karinaPhoto from '../imports/karina.png';
import maloiPhoto from '../imports/maloi.png';
import chaewonPhoto from '../imports/chaewon.png';
import asaPhoto from '../imports/asa.png';
import '../../css/Dashboard.css';

function CalendarIcon({
  className = "w-10 h-10",
  color = "#5b21b6",
}: {
  className?: string
  color?: string
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <rect
        x="6"
        y="10"
        width="36"
        height="32"
        rx="4"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M6 18h36" stroke={color} strokeWidth="2.5" />
      <path
        d="M16 6v8M32 6v8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="13"
        y="24"
        width="6"
        height="5"
        rx="1"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path
        d="M24 6a14 14 0 00-14 14v8l-4 6h36l-4-6v-8A14 14 0 0024 6z"
        stroke="#5b21b6"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M20 38a4 4 0 008 0" stroke="#5b21b6" strokeWidth="2.5" />
    </svg>
  )
}
function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path
        d="M24 6L8 12v14c0 9 7 16 16 18 9-2 16-9 16-18V12L24 6z"
        stroke="#e87c1e"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M17 24l5 5 9-9"
        stroke="#e87c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function PersonIcon({
  className = "w-10 h-10",
  color = "#5b21b6",
}: {
  className?: string
  color?: string
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="16" r="8" stroke={color} strokeWidth="2.5" />
      <path
        d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
function CardIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect
        x="6"
        y="12"
        width="36"
        height="24"
        rx="3"
        stroke="#e87c1e"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M6 20h36" stroke="#e87c1e" strokeWidth="2.5" />
      <rect x="12" y="28" width="10" height="3" rx="1" fill="#e87c1e" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path
        d="M24 38s-16-10-16-22a10 10 0 0116-8 10 10 0 0116 8c0 12-16 22-16 22z"
        stroke="#5b21b6"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  )
}
function DashedArrow() {
  return (
    <div className="flex items-center mx-2">
      <svg width="80" height="20" viewBox="0 0 80 20">
        <line
          x1="0"
          y1="10"
          x2="68"
          y2="10"
          stroke="#999"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <path d="M68 5l10 5-10 5" fill="none" stroke="#999" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

const howItWorksSteps = [
  {
    num: 1,
    icon: <PersonIcon />,
    title: "Owner Details",
    desc: "Enter the owner details",
    bg: "bg-purple-100",
  },
  {
    num: 2,
    icon: <img src={pawLogo} alt="Paw" className="w-10 h-10 object-contain" />,
    title: "Pet Information",
    desc: "Enter pet information such as species, breed, etc.",
    bg: "bg-orange-100",
  },
  {
    num: 3,
    icon: <CalendarIcon />,
    title: "Select The Date & Service",
    desc: "Select the time & date and the service for your appointment",
    bg: "bg-purple-100",
  },
  {
    num: 4,
    icon: <CardIcon />,
    title: "Down Payment",
    desc: "Pay the downpayment to ensure appointment",
    bg: "bg-orange-100",
  },
  {
    num: 5,
    icon: <HeartIcon />,
    title: "Wait for Approval",
    desc: "Wait for the approval of your appointment in your email",
    bg: "bg-purple-100",
  },
]

// â”€â”€â”€ Add Pet Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AddPetModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    age: "",
    sex: "",
    dob: "",
    weight: "",
    temp: "",
  })
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const inp =
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"

  return (
    <div className="paw-add-pet-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="paw-add-pet-card bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8">
        <h2 className="text-2xl font-extrabold text-[#1a0a3c] mb-0.5">
          Add New Pet
        </h2>
        <p className="text-sm text-gray-500 mb-6">Create New Pet</p>

        <div className="paw-add-pet-fields flex flex-col gap-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Patient/Pet Name
              </label>
              <input
                className={inp}
                placeholder="Pet Name"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Species
              </label>
              <input
                className={inp}
                placeholder="Dog/Cat"
                value={form.species}
                onChange={set("species")}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Breed
              </label>
              <input
                className={inp}
                placeholder="Golden Retriever"
                value={form.breed}
                onChange={set("breed")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Color/Markings
              </label>
              <input
                className={inp}
                placeholder="Black & White"
                value={form.color}
                onChange={set("color")}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Age
              </label>
              <input
                className={inp}
                placeholder="5"
                type="number"
                min="0"
                value={form.age}
                onChange={set("age")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Sex
              </label>
              <input
                className={inp}
                placeholder="Male/Female"
                value={form.sex}
                onChange={set("sex")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Date of Birth
              </label>
              <input
                className={inp}
                placeholder="MM/DD/YYYY"
                value={form.dob}
                onChange={set("dob")}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Weight
              </label>
              <input
                className={inp}
                placeholder="Kg"
                value={form.weight}
                onChange={set("weight")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Temperature
              </label>
              <input
                className={inp}
                placeholder="°C (optional)"
                value={form.temp}
                onChange={set("temp")}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onClose}
            className="border border-[#3b0f8c] text-[#3b0f8c] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-[#1a0a3c] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#2d0a6e] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Appointment Wizard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const APPT_STEPS = [
  "Owner Details",
  "Animal Signalment",
  "Select the Date & Service",
  "Payment",
  "Summary",
]
const UNAVAILABLE_TIMES = ["1 PM", "2 PM", "3 PM", "4 PM", "7 PM", "8 PM"]
const ALL_TIMES = [
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
  "12 AM",
  "1 AM",
]

// May 2026 starts on Friday (index 5 in Sun=0 week)
const MAY_2026 = { year: 2026, month: "May", startDay: 5, days: 31 }

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex w-full items-start">
      {APPT_STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            {i < APPT_STEPS.length - 1 && (
              <div
                className={`paw-step-connector absolute top-5 z-0 h-0.5 ${done ? 'bg-[#3b0f8c]' : 'bg-gray-300'}`}
                style={{ left: "calc(50% + 24px)", width: "calc(100% - 48px)" }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0
                ${
                  done
                    ? "bg-[#3b0f8c]"
                    : active
                      ? "bg-[#1a0a3c]"
                      : "bg-[#3b0f8c]"
                }`}
              >
                {done ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10l4 4 8-8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  active ? "font-bold text-[#1a0a3c]" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Step1({
  onNext,
  onCancel,
}: {
  onNext: () => void
  onCancel: () => void
}) {
  const inp =
    "border border-gray-300 rounded-full px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Owners Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            className={inp}
            defaultValue="Karina"
            placeholder="First Name"
          />
          <input
            className={inp}
            defaultValue="Cruz"
            placeholder="Middle Name"
          />
          <input className={inp} defaultValue="Ganda" placeholder="Last Name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Authorized Representative <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="First Name" />
          <input className={inp} placeholder="Last Name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            className={inp}
            defaultValue="09299667721"
            placeholder="Contact Number"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            className={inp}
            defaultValue="Kawina@gmail.com"
            placeholder="Email Address"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          className={inp}
          defaultValue="Blk 28 Lot 3 South Korea"
          placeholder="Address"
        />
      </div>
      <div className="flex justify-between pt-2">
        <button
          onClick={onCancel}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>("Lean")
  const [showAddPet, setShowAddPet] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)} />}
      <h3 className="text-xl font-extrabold text-[#1a0a3c]">Select pet(s)</h3>
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setSelected("Lean")}
          className={`border-2 rounded-xl p-4 flex items-center gap-3 w-56 transition-colors ${
            selected === "Lean"
              ? "border-[#3b0f8c] bg-purple-50"
              : "border-gray-200 hover:border-[#3b0f8c]"
          }`}
        >
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={leanPhoto}
              alt="Lean"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[#1a0a3c] text-sm">Lean</p>
            <p className="text-gray-500 text-xs">Aspin</p>
            <p className="text-gray-400 text-xs">3 years old</p>
            <span className="text-[#3b0f8c] text-xs font-medium">
              View Details
            </span>
          </div>
        </button>
        <button
          onClick={() => setShowAddPet(true)}
          className="border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 w-40 hover:border-[#3b0f8c] transition-colors"
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#3b0f8c] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#3b0f8c]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[#3b0f8c] font-bold text-xs">Add new pet</span>
        </button>
      </div>
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selectedDate, setSelectedDate] = useState<number | null>(15)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [service, setService] = useState("")

  const blanks = MAY_2026.startDay
  const cells = [
    ...Array(blanks).fill(null),
    ...Array(MAY_2026.days)
      .fill(0)
      .map((_, i) => i + 1),
  ]
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7)
    weeks.push(
      cells
        .slice(i, i + 7)
        .concat(Array(7).fill(null))
        .slice(0, 7),
    )

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Service */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Please input your pet's concern and the vaccination you'd like to schedule to
            help protect them from common diseases, or a checkup to monitor
            their overall health and well-being.
          </p>
          <input
            type="text"
            value={service}
            onChange={(event) => setService(event.target.value)}
            placeholder="Enter the service"
            aria-label="Service"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
          />
        </div>

        {/* Calendar */}
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-center font-bold text-[#1a0a3c] mb-3">May 2026</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs text-gray-500 font-medium py-1">
                {d}
              </div>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <button
                  key={`${wi}-${di}`}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(day)}
                  className={`text-xs py-1.5 rounded-full transition-colors ${
                    !day
                      ? ""
                      : day === selectedDate
                        ? "bg-[#3b0f8c] text-white font-bold"
                        : "hover:bg-purple-100 text-[#1a0a3c]"
                  }`}
                >
                  {day || ""}
                </button>
              )),
            )}
          </div>
        </div>

        {/* Time slots */}
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="font-bold text-[#1a0a3c] mb-3 text-sm">Select Time</p>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TIMES.map((t) => {
              const taken = UNAVAILABLE_TIMES.includes(t)
              const active = selectedTime === t
              return (
                <button
                  key={t}
                  disabled={taken}
                  onClick={() => !taken && setSelectedTime(t)}
                  className={`text-xs px-2 py-1.5 rounded-full border-2 font-semibold transition-colors ${
                    taken
                      ? "border-orange-400 bg-orange-50 text-orange-600 cursor-not-allowed"
                      : active
                        ? "border-orange-500 bg-orange-400 text-white"
                        : "border-[#3b0f8c] text-[#3b0f8c] hover:bg-purple-50"
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-400" aria-hidden="true" />
              Already selected
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#3b0f8c]" aria-hidden="true" />
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Step4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const inp =
    "border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Left â€” terms + form */}
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm text-[#1a0a3c]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 flex-shrink-0 accent-[#3b0f8c]"
            />
            <span>
              By checking and booking an appointment, you agree to pay a{" "}
              <strong>₱200 non-refundable down payment</strong> to secure your
              slot.
            </span>
          </label>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-1">
            <li>
              The down payment will be deducted from the total service fee.
            </li>
            <li>
              Appointments will only be confirmed after payment and receipt
              upload are completed.
            </li>
            <li>
              You must upload a valid proof of payment (receipt or screenshot)
              during booking.
            </li>
            <li>
              Cancellations or no-shows will result in forfeiture of the down
              payment.
            </li>
            <li>
              Rescheduling is allowed if requested at least 24 hours before the
              appointment.
            </li>
          </ul>
          <div>
            <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
              Upload Attachment
            </label>
            <input
              className={inp}
              placeholder="Select an Attachment"
              type="file"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
              Reference Number
            </label>
            <input className={inp} placeholder="Input the reference number" />
          </div>
        </div>

        {/* Right â€” QR code */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-extrabold text-[#1a0a3c] text-lg underline">
            PAY HERE
          </p>
          <div className="flex flex-col items-center px-3 pt-3 pb-2">
            <p className="mb-2 text-center text-sm font-extrabold text-black">Big Paw's Clinic</p>
            <img
              src={qrCode}
              alt="Payment QR code"
              className="h-48 w-48 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Step5({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Owner Details */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">Owner Details</p>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Full Name</p>
            <p className="text-xs text-gray-600">Karina Cruz Ganda</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">
              Authorized Representative
            </p>
            <p className="text-xs text-gray-600">Jane Doe</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Contact Number</p>
              <p className="text-xs text-gray-600">09299667721</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Email Address</p>
              <p className="text-xs text-gray-600">Kawina@gmail.com</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Address</p>
            <p className="text-xs text-gray-600">Blk 28 Lot 3 South Korea</p>
          </div>
        </div>

        {/* Animal Signalment */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">
            Animal Signalment
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">
                Patient/Pet Name
              </p>
              <p className="text-xs text-gray-600">Lean Angelus</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Species</p>
              <p className="text-xs text-gray-600">Dog</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Breed</p>
            <p className="text-xs text-gray-600">Aspin</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Date of Birth</p>
              <p className="text-xs text-gray-400">--/--/----</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Age</p>
              <p className="text-xs text-gray-600">3</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Color/Markings</p>
              <p className="text-xs text-gray-600">Brown/Polka dots</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Weight</p>
              <p className="text-xs text-gray-600">8kg</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Temperature</p>
              <p className="text-xs text-gray-400">--/--/----</p>
            </div>
          </div>
        </div>

        {/* Confirm Date */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">Selected Date</p>
          <div className="flex justify-center">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              <rect
                x="6"
                y="14"
                width="52"
                height="44"
                rx="5"
                stroke="#1a0a3c"
                strokeWidth="3"
              />
              <path d="M6 26h52" stroke="#1a0a3c" strokeWidth="3" />
              <path
                d="M20 8v12M44 8v12"
                stroke="#1a0a3c"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>
              Your selected date for appointment:{" "}
              <span className="text-[#3b0f8c] font-medium">
                May 15, 2026 at 4:00AM
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span>Wait for your appointment confirmation</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>
              We'll contact you in your email:{" "}
              <span className="text-[#3b0f8c] font-medium">
                Kawina@gmail.com
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onDone}
          className="bg-[#3b0f8c] text-white px-8 py-2 rounded-full text-sm font-bold hover:bg-[#2d0a6e] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function AppointmentWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const next = () => setStep((s) => Math.min(s + 1, 4))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="paw-appointment-flow flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onBack}
          className="text-[#3b0f8c] font-medium hover:underline flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
          </svg>
          Dashboard
        </button>
        <span className="text-gray-400">â€º</span>
        <span className="text-gray-600 font-medium">Appointment</span>
      </div>

      {/* Card */}
      <div className="paw-appointment-card bg-white rounded-2xl border border-purple-200 p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#1a0a3c] mb-1">
          Make an Appointment
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Book a visit for your pet in simple steps.
        </p>
        <div className="border-t border-gray-100 pt-6">
          <StepIndicator current={step} />
          <div className="border-t border-gray-100 pt-6">
            {step === 0 && <Step1 onNext={next} onCancel={onBack} />}
            {step === 1 && <Step2 onNext={next} onBack={back} />}
            {step === 2 && <Step3 onNext={next} onBack={back} />}
            {step === 3 && <Step4 onNext={next} onBack={back} />}
            {step === 4 && <Step5 onBack={back} onDone={onBack} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type DashSection = "home" | "records" | "appointments" | "settings"
type AdminSection = "home" | "services" | "supplies" | "users" | "settings"

function CustomerDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<DashSection>("home")
  const [booking, setBooking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: DashSection; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "records",
      label: "Pet Medical Records",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <div className={`paw-dashboard-shell paw-customer-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      <header className="paw-customer-topbar">
        <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
        </button>
        <img src={bigpawLogo} alt="PawControl" className="paw-customer-brand" />
        <div className="paw-customer-userbar">
          <div className="relative paw-customer-bell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
            </svg>
            <span>3</span>
          </div>
          <div className="paw-customer-avatar" aria-hidden="true">
            <img src={karinaPhoto} alt="" />
          </div>
          <span>{username}</span>
        </div>
      </header>
      <div className="paw-customer-workspace">
      <aside className="paw-dashboard-sidebar paw-customer-sidebar bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSection(item.id)
                setBooking(false)
              }}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                section === item.id && !booking
                  ? "bg-orange-400 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
            />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
          LOGOUT
        </button>
      </aside>
      <div className="paw-customer-content flex-1 flex flex-col overflow-hidden">
        <main className="paw-dashboard-main paw-customer-main flex-1 overflow-y-auto">
          {booking ? (
            <AppointmentWizard onBack={() => setBooking(false)} />
          ) : (
            <>
              {section === "home" && (
                <HomeSection
                  username={username}
                  onBookAppointment={() => setBooking(true)}
                  onViewRecords={() => setSection("records")}
                  onViewAppointments={() => setSection("appointments")}
                />
              )}
              {section === "records" && (
                <PlaceholderSection title="Pet Medical Records" />
              )}
              {section === "appointments" && (
                <PlaceholderSection title="Appointments" />
              )}
              {section === "settings" && (
                <PlaceholderSection title="User Settings" />
              )}
            </>
          )}
        </main>
      </div>
      </div>
    </div>
  )
}

function HomeSection({
  username,
  onBookAppointment,
  onViewRecords,
  onViewAppointments,
}: {
  username: string
  onBookAppointment: () => void
  onViewRecords: () => void
  onViewAppointments: () => void
}) {
  const [showAddPet, setShowAddPet] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)} />}
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <CalendarIcon color="#5b21b6" />
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Upcoming Appointments
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewAppointments} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <img src={pawLogo} alt="Paw" className="w-12 h-12 object-contain" />
          <div>
            <p className="text-sm text-gray-500 font-medium">Pet's Records</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewRecords} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">View Details</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <svg
            className="w-12 h-12 flex-shrink-0"
            viewBox="0 0 48 48"
            fill="none"
          >
            <rect
              x="8"
              y="6"
              width="32"
              height="38"
              rx="3"
              stroke="#9ca3af"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M16 16h16M16 22h16M16 28h10"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="22"
              y="30"
              width="12"
              height="10"
              rx="1"
              stroke="#9ca3af"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Appointment History
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewAppointments} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#e87c1e] font-bold text-lg mb-4">
            My Pets Record
          </h2>
          <div className="flex gap-4 flex-wrap">
            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 w-56">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-200 flex-shrink-0">
                <img
                  src={leanPhoto}
                  alt="Lean"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-extrabold text-[#1a0a3c] text-sm">Lean</p>
                <p className="text-gray-500 text-xs">Aspin</p>
                <p className="text-gray-400 text-xs">3 years old</p>
                <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                  View Details
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddPet(true)}
              className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 w-40 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#3b0f8c] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#3b0f8c]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[#3b0f8c] font-bold text-xs">
                Add New Pet
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" color="#3b0f8c" />
            <span className="text-[#3b0f8c] font-bold text-sm">
              Next Appointment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-200 flex-shrink-0">
              <img
                src={leanPhoto}
                alt="Lean"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-extrabold text-[#1a0a3c] text-base">Lean</p>
              <p className="text-gray-500 text-xs">Aspin</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              May 15, 2026 (Friday)
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
              11:00 PM
            </div>
          </div>
          <button onClick={onViewAppointments} className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
            View Appointment Details
          </button>
          <button
            onClick={onBookAppointment}
            className="w-full border border-orange-400 text-orange-500 hover:bg-orange-50 font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            + Book New Appointment
          </button>
        </div>
      </div>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">{title}</h1>
      <div className="bg-white rounded-2xl p-12 shadow-sm flex items-center justify-center text-gray-400 text-sm">
        {title} content coming soon.
      </div>
    </div>
  )
}

// â”€â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AdminDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<AdminSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "services",
      label: "Manage Services",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "supplies",
      label: "Manage Medical Supplies",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6v4l3 3v10H6V10l3-3V3Z" strokeLinejoin="round" />
          <path d="M9 7h6M12 11v6M9 14h6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "Manage Users",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="7" r="4" />
          <path
            d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"
            strokeLinecap="round"
          />
          <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
          <path d="M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <div className={`paw-dashboard-shell paw-staff-dashboard paw-admin-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      {/* Sidebar */}
      <aside className="paw-dashboard-sidebar w-64 bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-16">
          <button className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <img src={bigpawLogo} alt="BigPaw" className="h-9 object-contain" />
        </div>
        <div className="h-1 bg-orange-400" />
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                section === item.id
                  ? "bg-orange-400 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
            />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
          LOGOUT
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="paw-dashboard-header paw-staff-topbar bg-[#1a0a3c] h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0">
          <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <img src={bigpawLogo} alt="PawControl" className="paw-customer-brand" />
          <div className="relative">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-rose-400 flex items-center justify-center overflow-hidden border-2 border-orange-400">
              <img src={chaewonPhoto} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{username}</span>
              <span className="text-gray-400 text-xs">Admin</span>
            </div>
          </div>
        </header>
        <div className="h-1 bg-orange-400 flex-shrink-0" />

        <main className="paw-dashboard-main flex-1 overflow-y-auto p-8">
          {section === "home" && <AdminHomeSection username={username} />}
          {section === "services" && <AdminPlaceholder title="Manage Services" />}
          {section === "supplies" && <AdminPlaceholder title="Manage Medical Supplies" />}
          {section === "users" && <AdminManageUsers />}
          {section === "settings" && <AdminPlaceholder title="User Settings" />}
        </main>
      </div>
    </div>
  )
}

function AdminHomeSection({ username }: { username: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
            <img src={pawLogo} alt="Paw" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">118</p>
            <p className="text-[#e87c1e] text-xs font-semibold mt-0.5">
              +30 this month
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
              <rect
                x="4"
                y="12"
                width="40"
                height="24"
                rx="4"
                stroke="#374151"
                strokeWidth="2.5"
              />
              <path d="M4 20h40" stroke="#374151" strokeWidth="2.5" />
              <rect x="10" y="28" width="8" height="3" rx="1" fill="#374151" />
              <rect
                x="22"
                y="28"
                width="14"
                height="3"
                rx="1.5"
                fill="#374151"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
            <p className="text-3xl font-extrabold text-[#1a0a3c]">
              +412,850.00
            </p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +8.64% vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="currentColor">
              <circle cx="16" cy="16" r="7" fill="#374151" />
              <circle cx="32" cy="16" r="7" fill="#374151" opacity="0.6" />
              <path d="M4 40c0-8 5-12 12-12s12 4 12 12" fill="#374151" />
              <path
                d="M28 40c0-8 5-12 12-12"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">22</p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row â€” same as Clerk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#3b0f8c] font-bold text-lg mb-4">
            Todays' Operation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PATIENTS.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                <PetAvatar name={p.name} photo={p.photo} />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${
                      p.status === "On Going"
                        ? "text-green-500"
                        : "text-orange-400"
                    }`}
                  >
                    {p.status}
                  </p>
                  <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight">
                    {p.name}
                  </p>
                  <p className="text-gray-500 text-xs">{p.breed}</p>
                  <p className="text-gray-400 text-xs">
                    {p.age} {p.age === 1 ? "year" : "years"} old
                  </p>
                  <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Day Appointment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#3b0f8c" />
              <span className="text-[#3b0f8c] font-bold text-sm">
                Next Day Appointment
              </span>
            </div>
            <button className="text-[#3b0f8c] text-xs font-medium hover:underline">
              See more &gt;
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {NEXT_APPOINTMENTS.map((apt) => (
              <div key={apt.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <PetAvatar name={apt.name} photo={apt.photo} size="lg" />
                  <div>
                    <p className="font-extrabold text-[#1a0a3c] text-base leading-tight">
                      {apt.name}
                    </p>
                    <p className="text-gray-500 text-xs">{apt.breed}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-600 pl-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                    </svg>
                    {apt.time}
                  </div>
                </div>
                <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs transition-colors">
                  View Appointment Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const MOCK_USERS = [
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

function AdminManageUsers() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const roleBadge: Record<string, string> = {
    Admin: "bg-red-100 text-red-500 border border-red-300",
    Clerk: "bg-yellow-100 text-yellow-600 border border-yellow-300",
    Veterinarian: "bg-green-100 text-green-600 border border-green-300",
    Customer: "bg-purple-100 text-purple-600 border border-purple-300",
  }

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter
    const matchStatus =
      statusFilter === "All Status" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="paw-admin-users flex flex-col gap-6">
      {/* Title row */}
      <div className="paw-admin-users-heading flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
            Manage Users
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View, edit, and manage system users and their roles
          </p>
        </div>
        <button className="bg-[#1a0a3c] hover:bg-[#2d0a6e] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
          + Add New User
        </button>
      </div>

      {/* Stat cards */}
      <div className="paw-admin-users-stats grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total Users",
            value: "22",
            sub: null,
            icon: (
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="#1a0a3c">
                <circle cx="10" cy="10" r="4" />
                <circle cx="22" cy="10" r="4" opacity=".5" />
                <path d="M2 28c0-5 3.6-8 8-8s8 3 8 8" />
                <path
                  d="M20 28c0-5 2.4-8 6-8"
                  stroke="#1a0a3c"
                  strokeWidth="1.5"
                  fill="none"
                  opacity=".5"
                />
              </svg>
            ),
          },
          {
            label: "Customer Users",
            value: "17",
            sub: null,
            icon: (
              <svg
                className="w-8 h-8"
                viewBox="0 0 32 32"
                fill="none"
                stroke="#3b0f8c"
                strokeWidth="2"
              >
                <circle cx="16" cy="10" r="5" />
                <path d="M6 28c0-5.5 4.5-9 10-9" strokeLinecap="round" />
                <path
                  d="M23 22l2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            color: "text-[#3b0f8c]",
          },
          {
            label: "Clinic Users",
            value: "5",
            sub: null,
            icon: (
              <svg
                className="w-8 h-8"
                viewBox="0 0 32 32"
                fill="none"
                stroke="#e87c1e"
                strokeWidth="2"
              >
                <circle cx="16" cy="10" r="5" />
                <path
                  d="M6 28c0-5.5 4.5-9 10-9s10 3.5 10 9"
                  strokeLinecap="round"
                />
                <path d="M16 18v-4M14 16h4" strokeLinecap="round" />
              </svg>
            ),
            color: "text-[#e87c1e]",
          },
          {
            label: "Active Users",
            value: "20",
            sub: "+3 This month",
            icon: (
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" fill="#22c55e" />
                <path
                  d="M10 16l4 4 8-8"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            color: "text-green-500",
          },
          {
            label: "Inactive Users",
            value: "2",
            sub: "+2 This Month",
            icon: (
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="4"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <path
                  d="M16 6v4M16 22v4M6 16h4M22 16h4"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            color: "text-gray-400",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="paw-admin-user-stat bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className="flex-shrink-0">{c.icon}</div>
            <div>
              <p
                className={`text-xs font-semibold ${c.color ?? "text-gray-500"}`}
              >
                {c.label}
              </p>
              <p className="text-2xl font-extrabold text-[#1a0a3c]">
                {c.value}
              </p>
              {c.sub && <p className="text-[10px] text-gray-400">{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="paw-admin-users-filters bg-white rounded-xl shadow-sm px-5 py-4">
        <div className="paw-admin-users-filter-controls flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by users, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Roles
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white"
            >
              {["All Roles", "Admin", "Clerk", "Veterinarian", "Customer"].map(
                (r) => (
                  <option key={r}>{r}</option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white"
            >
              {["All Status", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
              </svg>
              Filters
            </button>
            <button
              onClick={() => {
                setSearch("")
                setRoleFilter("All Roles")
                setStatusFilter("All Status")
              }}
              className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path
                  d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
                  strokeLinecap="round"
                />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="paw-admin-users-table bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Users",
                "Role",
                "Email",
                "Last Login",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left font-bold text-[#1a0a3c] text-sm"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {u.photo ? (
                        <img
                          src={u.photo}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                          {u.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a0a3c]">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {u.lastLogin}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" strokeLinecap="round" />
                      </svg>
                      {u.lastLoginTime}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      u.status === "Active"
                        ? "border-green-400 text-green-600 bg-green-50"
                        : "border-gray-300 text-gray-500 bg-gray-50"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button type="button" aria-label={`Actions for ${u.name}`} className="paw-admin-user-actions flex items-center justify-center p-2 rounded text-gray-500 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="1.75" />
                      <circle cx="12" cy="12" r="1.75" />
                      <circle cx="12" cy="19" r="1.75" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="paw-admin-users-pagination flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1 to {filtered.length} of 22 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              &lt; Previous
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 text-xs rounded-lg font-semibold ${
                  n === 1
                    ? "bg-[#1a0a3c] text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-gray-400 text-xs">...</span>
            <button className="w-8 h-8 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              5
            </button>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MOCK_SALES = [
  { month: "Jan", amount: 38200 },
  { month: "Feb", amount: 45600 },
  { month: "Mar", amount: 52100 },
  { month: "Apr", amount: 48750 },
  { month: "May", amount: 61400 },
  { month: "Jun", amount: 57300 },
]

function AdminSalesReports({ ownerView = false }: { ownerView?: boolean }) {
  const max = Math.max(...MOCK_SALES.map((s) => s.amount))
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Sales Reports</h1>
        {ownerView && (
          <button
            type="button"
            className="min-h-10 whitespace-nowrap rounded-xl bg-[#19043f] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(25,4,63,0.2)] transition-colors hover:bg-[#2d0a6e]"
          >
            Generate Sales Report
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Total Revenue",
            value: "₱412,850.00",
            sub: "+8.64% vs last week",
            color: "text-green-500",
          },
          {
            label: "This Month",
            value: "₱61,400.00",
            sub: "+7.2% vs last month",
            color: "text-green-500",
          },
          {
            label: "Transactions",
            value: "284",
            sub: "May 2026",
            color: "text-gray-400",
          },
        ].map((c) => (
          <div key={c.label} className={`relative overflow-hidden bg-white rounded-2xl p-6 ${ownerView ? 'border border-violet-100 shadow-[0_8px_24px_rgba(26,10,60,0.06)]' : 'shadow-sm'}`}>
            {ownerView && <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3b0f8c] to-[#ffbb50]" />}
            <p className="text-sm text-gray-500 font-medium mb-2">{c.label}</p>
            <p className="text-3xl font-extrabold tracking-tight text-[#1a0a3c]">{c.value}</p>
            <p className={`text-xs font-semibold mt-2 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className={`bg-white rounded-2xl p-6 ${ownerView ? 'border border-violet-100 shadow-[0_8px_24px_rgba(26,10,60,0.06)]' : 'shadow-sm'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-bold text-lg text-[#1a0a3c]">Monthly Revenue</p>
            <p className="mt-1 text-xs text-gray-500">Revenue collected across the year</p>
          </div>
          {ownerView && (
            <select
              aria-label="Revenue date range"
              defaultValue="This year"
              className="rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5 text-sm font-semibold text-[#3b0f8c] focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
          )}
        </div>
        <div className={`flex items-end gap-4 h-64 rounded-xl px-4 pt-4 ${ownerView ? 'bg-slate-50/80' : ''}`}>
          {MOCK_SALES.map((s) => (
            <div
              key={s.month}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-gray-500 font-medium">
                ₱{(s.amount / 1000).toFixed(0)}K
              </span>
              <div
                className={`w-full rounded-t-lg transition-colors ${ownerView ? 'bg-gradient-to-t from-[#3b0f8c] to-[#7044bd] hover:from-orange-400 hover:to-amber-300' : 'bg-[#3b0f8c] hover:bg-orange-400'} cursor-pointer`}
                style={{ height: `${(s.amount / max) * 160}px` }}
              />
              <span className="text-xs text-gray-500">{s.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className={`paw-recent-transactions bg-white rounded-2xl shadow-sm overflow-hidden ${ownerView ? 'owner-transactions' : ''}`}>
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-bold text-[#1a0a3c]">Recent Transactions</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {["Date", "Patient", "Service", "Amount", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              {
                date: "May 15, 2026",
                patient: "Lean (Aspin)",
                service: "Checkup",
                amount: "₱850",
                status: "Paid",
              },
              {
                date: "May 14, 2026",
                patient: "Sion (Poodle)",
                service: "Vaccination",
                amount: "₱1,200",
                status: "Paid",
              },
              {
                date: "May 14, 2026",
                patient: "Moy (Exotic Shorthair)",
                service: "Surgery",
                amount: "₱8,500",
                status: "Pending",
              },
              {
                date: "May 13, 2026",
                patient: "Bincent (Oriental SH)",
                service: "Checkup",
                amount: "₱850",
                status: "Paid",
              },
              {
                date: "May 13, 2026",
                patient: "John A. (Newfoundland)",
                service: "Vaccination",
                amount: "₱1,200",
                status: "Paid",
              },
            ].map((t, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{t.date}</td>
                <td className="px-6 py-4 font-semibold text-[#1a0a3c]">
                  {t.patient}
                </td>
                <td className="px-6 py-4 text-gray-600">{t.service}</td>
                <td className="px-6 py-4 font-bold text-[#1a0a3c]">
                  {t.amount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      t.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">{title}</h1>
      <div className="bg-white rounded-2xl p-12 shadow-sm flex items-center justify-center text-gray-400 text-sm">
        {title} content coming soon.
      </div>
    </div>
  )
}

// â”€â”€â”€ Clerk Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type ClerkSection = "home" | "records" | "appointments" | "billings" | "settings"

const MOCK_PATIENTS = [
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

const NEXT_APPOINTMENTS = [
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

function PetAvatar({
  name,
  photo,
  size = "md",
}: {
  name: string
  photo: string | null
  size?: "sm" | "md" | "lg"
}) {
  const dim =
    size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-14 h-14"
  const colors = [
    "bg-amber-300",
    "bg-teal-300",
    "bg-rose-300",
    "bg-sky-300",
    "bg-violet-300",
    "bg-lime-300",
  ]
  const bg = colors[name.charCodeAt(0) % colors.length]
  if (photo) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0`}>
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className={`${dim} rounded-full ${bg} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}
    >
      {name[0]}
    </div>
  )
}

function ClerkDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<ClerkSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: ClerkSection; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "records",
      label: "Pet Medical Records",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "billings",
      label: "Billings",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          <path
            d="M16 16l2 2 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <div className={`paw-dashboard-shell paw-staff-dashboard paw-clerk-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      {/* Sidebar */}
      <aside className="paw-dashboard-sidebar w-64 bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-16">
          <button className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <img src={bigpawLogo} alt="BigPaw" className="h-9 object-contain" />
        </div>
        <div className="h-1 bg-orange-400" />
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                section === item.id
                  ? "bg-orange-400 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
            />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
          LOGOUT
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="paw-dashboard-header paw-staff-topbar bg-[#1a0a3c] h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0">
          <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <img src={bigpawLogo} alt="PawControl" className="paw-customer-brand" />
          <div className="relative">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center overflow-hidden border-2 border-orange-400">
              <img src={maloiPhoto} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{username}</span>
              <span className="text-gray-400 text-xs">Clerk</span>
            </div>
          </div>
        </header>
        <div className="h-1 bg-orange-400 flex-shrink-0" />

        <main className="paw-dashboard-main flex-1 overflow-y-auto p-8">
          {section === "home" && (
            <StaffHomeSection username={username} role="Clerk" />
          )}
          {section === "records" && (
            <ClerkPlaceholder title="Pet Medical Records" />
          )}
          {section === "appointments" && <ClerkAppointments />}
          {section === "billings" && <ClerkPlaceholder title="Billings" />}
          {section === "settings" && <ClerkPlaceholder title="User Settings" />}
        </main>
      </div>
    </div>
  )
}

function StaffHomeSection({
  username,
  role,
}: {
  username: string
  role: "Clerk" | "Veterinarian"
}) {
  const isVeterinarian = role === "Veterinarian"

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {isVeterinarian ? `Doc ${username}` : username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <img
            src={pawLogo}
            alt="Paw"
            className="w-12 h-12 object-contain flex-shrink-0"
          />
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">118</p>
            <p className="text-[#e87c1e] text-xs font-semibold mt-0.5">
              +30 this month
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        {/* Appointments */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <CalendarIcon color="#5b21b6" />
          <div>
            <p className="text-sm text-gray-500 font-medium">Appointments</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">8</p>
            {!isVeterinarian && (
              <p className="text-red-500 text-xs font-semibold mt-0.5">
                1 Pending
              </p>
            )}
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        {/* Role-specific third metric */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <svg
            className="w-12 h-12 flex-shrink-0"
            viewBox="0 0 48 48"
            fill="none"
          >
            <rect
              x="8"
              y="4"
              width="32"
              height="40"
              rx="3"
              stroke="#9ca3af"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M16 14h16M16 20h16M16 26h10"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14 36h6M24 33l3 3-3 3"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {isVeterinarian ? "# of Operation Today" : "Upcoming Billing"}
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">
              {isVeterinarian ? 4 : 3}
            </p>
            {!isVeterinarian && (
              <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                View Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#3b0f8c] font-bold text-lg mb-4">
            Todays' Operation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PATIENTS.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                <PetAvatar name={p.name} photo={p.photo} />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${
                      p.status === "On Going"
                        ? "text-green-500"
                        : "text-orange-400"
                    }`}
                  >
                    {p.status}
                  </p>
                  <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight">
                    {p.name}
                  </p>
                  <p className="text-gray-500 text-xs">{p.breed}</p>
                  <p className="text-gray-400 text-xs">
                    {p.age} {p.age === 1 ? "year" : "years"} old
                  </p>
                  <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Day Appointment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#3b0f8c" />
              <span className="text-[#3b0f8c] font-bold text-sm">
                Next Day Appointment
              </span>
            </div>
            <button className="text-[#3b0f8c] text-xs font-medium hover:underline">
              See more &gt;
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {NEXT_APPOINTMENTS.map((apt) => (
              <div key={apt.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <PetAvatar name={apt.name} photo={apt.photo} size="lg" />
                  <div>
                    <p className="font-extrabold text-[#1a0a3c] text-base leading-tight">
                      {apt.name}
                    </p>
                    <p className="text-gray-500 text-xs">{apt.breed}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-600 pl-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                    </svg>
                    {apt.time}
                  </div>
                </div>
                <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs transition-colors">
                  View Appointment Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const MOCK_APPOINTMENTS = [
  {
    id: "ID-0005",
    owner: "Gusion Q. Pogi",
    phone: "09887766521",
    pet: "Kwek-Kwek",
    photo: null,
    date: "May 9, 2026",
    time: "1:00 PM",
    type: "Check-up",
    status: "Pending",
  },
  {
    id: "ID-0006",
    owner: "Jojo P. Muzon",
    phone: "09231122331",
    pet: "Siomai",
    photo: leanPhoto,
    date: "May 21, 2026",
    time: "5:00 PM",
    type: "Check-up",
    status: "Pending",
  },
  {
    id: "ID-0007",
    owner: "Lebron W. James",
    phone: "09176762131",
    pet: "Kikiam",
    photo: null,
    date: "May 25, 2026",
    time: "10:00 AM",
    type: "Check-up",
    status: "Cancelled",
  },
  {
    id: "ID-0008",
    owner: "Maria Santos",
    phone: "09123456789",
    pet: "Mochi",
    photo: null,
    date: "May 28, 2026",
    time: "2:00 PM",
    type: "Vaccination",
    status: "Confirmed",
  },
]

function ClerkAppointments({
  veterinarianView = false,
}: {
  veterinarianView?: boolean
}) {
  const [filter, setFilter] =
    useState<"All" | "Pending" | "Confirmed" | "Cancelled">("All")
  const [search, setSearch] = useState("")

  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter
    const matchSearch = [a.owner, a.pet, a.type].some((f) =>
      f.toLowerCase().includes(search.toLowerCase()),
    )
    return matchFilter && matchSearch
  })

  const statusBadge: Record<string, string> = {
    Pending: "border border-yellow-400 text-yellow-600 bg-yellow-50",
    Confirmed: "border border-blue-400 text-blue-600 bg-blue-50",
    Cancelled: "bg-red-400 text-white",
  }

  return (
    <div className={`paw-appointments-view flex flex-col gap-6 ${veterinarianView ? 'vet-view' : ''}`}>
      {/* Title row */}
      <div className="paw-appointments-heading flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
            Appointments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Upcoming Appointments
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by pet name, owner, breed, veterinarian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] w-72"
            />
          </div>
          <button className="bg-[#1a0a3c] hover:bg-[#2d0a6e] text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
            + New Appointment
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {!veterinarianView && (
        <div className="paw-appointment-filterbar bg-white rounded-xl shadow-sm px-6 py-4 flex items-center gap-6">
          {(["All", "Pending", "Confirmed", "Cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                filter === f
                  ? "text-[#1a0a3c]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f !== "All" && (
                <span
                  className={`w-3 h-3 rounded-full ${
                    f === "Pending"
                      ? "bg-yellow-400"
                      : f === "Confirmed"
                        ? "bg-blue-400"
                        : "bg-red-500"
                  }`}
                />
              )}
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Owner",
                "Pet",
                "Date",
                "Time",
                "Type",
                ...(veterinarianView ? [] : ["Status"]),
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left font-bold text-[#1a0a3c]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a0a3c] text-sm">
                    {a.owner}
                  </p>
                  <p className="text-gray-400 text-xs">{a.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {a.photo ? (
                        <img
                          src={a.photo}
                          alt={a.pet}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                          {a.pet[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#1a0a3c]">{a.pet}</p>
                      <p className="text-gray-400 text-xs">{a.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{a.date}</td>
                <td className="px-5 py-4 text-gray-600">{a.time}</td>
                <td className="px-5 py-4 text-gray-600">{a.type}</td>
                {!veterinarianView && (
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </td>
                )}
                <td className="px-5 py-4">
                  <span
                    aria-label={`View ${a.pet}'s appointment`}
                    className="flex w-fit items-center justify-center p-2 text-gray-500"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="paw-appointments-pagination flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1 to {filtered.length} of 118 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              &lt; Previous
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 text-xs rounded-lg font-semibold ${
                  n === 1
                    ? "bg-[#1a0a3c] text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-gray-400 text-xs">...</span>
            <button className="w-8 h-8 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              24
            </button>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Veterinarian Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type VeterinarianSection = "home" | "records" | "appointments" | "settings"

function VeterinarianDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<VeterinarianSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: {
    id: VeterinarianSection
    label: string
    icon: ReactNode
  }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "records",
      label: "Pet Medical Records",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <div className={`paw-dashboard-shell paw-staff-dashboard paw-vet-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      <aside className="paw-dashboard-sidebar w-64 bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-16">
          <button className="text-white" aria-label="Toggle navigation">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <img src={bigpawLogo} alt="BigPaw" className="h-9 object-contain" />
        </div>
        <div className="h-1 bg-orange-400" />

        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                section === item.id
                  ? "bg-orange-400 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
            />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
          LOGOUT
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="paw-dashboard-header paw-staff-topbar bg-[#1a0a3c] h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0">
          <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <img src={bigpawLogo} alt="PawControl" className="paw-customer-brand" />
          <div className="relative">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-violet-400 flex items-center justify-center overflow-hidden border-2 border-orange-400">
              <img src={haerinPhoto} alt="Haerin" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{username}</span>
              <span className="text-gray-400 text-xs">Veterinarian</span>
            </div>
          </div>
        </header>
        <div className="h-1 bg-orange-400 flex-shrink-0" />

        <main className="paw-dashboard-main flex-1 overflow-y-auto p-8">
          {section === "home" && (
            <StaffHomeSection username={username} role="Veterinarian" />
          )}
          {section === "records" && (
            <ClerkPlaceholder title="Pet Medical Records" />
          )}
          {section === "appointments" && <ClerkAppointments veterinarianView />}
          {section === "settings" && <ClerkPlaceholder title="User Settings" />}
        </main>
      </div>
    </div>
  )
}

function ClerkPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">{title}</h1>
      <div className="bg-white rounded-2xl p-12 shadow-sm flex items-center justify-center text-gray-400 text-sm">
        {title} content coming soon.
      </div>
    </div>
  )
}

// â”€â”€â”€ Owner Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type OwnerSection = "home" | "records" | "sales" | "settings"

function OwnerHomeSection({ username }: { username: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
            <img src={pawLogo} alt="Paw" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">118</p>
            <p className="text-[#e87c1e] text-xs font-semibold mt-0.5">
              +30 this month
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
              <rect
                x="4"
                y="12"
                width="40"
                height="24"
                rx="4"
                stroke="#374151"
                strokeWidth="2.5"
              />
              <path d="M4 20h40" stroke="#374151" strokeWidth="2.5" />
              <rect x="10" y="28" width="8" height="3" rx="1" fill="#374151" />
              <rect
                x="22"
                y="28"
                width="14"
                height="3"
                rx="1.5"
                fill="#374151"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
            <p className="text-3xl font-extrabold text-[#1a0a3c]">
              ₱412,850.00
            </p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +8.64% vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Monthly Appointments */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <CalendarIcon className="w-10 h-10" color="#374151" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Monthly Appointments
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">149</p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +23 vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#3b0f8c] font-bold text-lg mb-4">Patients</h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PATIENTS.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                <PetAvatar name={p.name} photo={p.photo} />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${
                      p.status === "On Going"
                        ? "text-green-500"
                        : "text-orange-400"
                    }`}
                  >
                    {p.status}
                  </p>
                  <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight">
                    {p.name}
                  </p>
                  <p className="text-gray-500 text-xs">{p.breed}</p>
                  <p className="text-gray-400 text-xs">
                    {p.age} {p.age === 1 ? "year" : "years"} old
                  </p>
                  <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Report preview â€” line chart */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_10px_30px_rgba(26,10,60,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-violet-500">Performance</span>
              <h2 className="mt-1 text-lg font-extrabold text-[#1a0a3c]">Sales Report</h2>
            </div>
            <button className="rounded-lg px-2 py-1 text-xs font-bold text-[#3b0f8c] transition-colors hover:bg-violet-50">
              See more <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Revenue trend</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a0a3c]">₱61,400</p>
            </div>
            <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">↗ 8.64%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-violet-50/70 px-3 py-2">
            <span className="text-xs font-semibold text-[#3b0f8c]">Daily revenue</span>
            <span className="rounded-md border border-violet-100 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600">May 14–19</span>
          </div>
          {/* Simple SVG line chart */}
          <div className="h-40 rounded-xl bg-gradient-to-b from-violet-50/70 to-white p-2">
            <svg
              viewBox="0 0 280 130"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="ownerRevenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7044bd" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7044bd" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[28, 55, 82, 109].map((y) => <line key={y} x1="48" y1={y} x2="272" y2={y} stroke="#e9e3f5" strokeDasharray="3 4" />)}
              {/* Y axis labels */}
              {[
                ["₱60K", 30],
                ["₱40K", 58],
                ["₱20K", 85],
                ["₱0", 112],
              ].map(([label, y]) => (
                <text
                  key={label as string}
                  x="2"
                  y={Number(y)}
                  fontSize="7"
                  fill="#9ca3af"
                >
                  {label as string}
                </text>
              ))}
              <polygon points="55,82 90,80 120,76 150,74 180,72 210,68 240,60 270,50 270,112 55,112" fill="url(#ownerRevenueFill)" />
              {/* Line */}
              <polyline
                points="55,82 90,80 120,76 150,74 180,72 210,68 240,60 270,50"
                fill="none"
                stroke="#3b0f8c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {[
                [55, 82],
                [90, 80],
                [120, 76],
                [150, 74],
                [180, 72],
                [210, 68],
                [240, 60],
                [270, 50],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="white"
                  stroke="#3b0f8c"
                  strokeWidth="2"
                />
              ))}
              {/* X axis labels */}
              {[
                ["May 14", 55],
                ["May 15", 90],
                ["May 16", 120],
                ["May 17", 150],
                ["May 18", 180],
                ["May 19", 210],
              ].map(([label, x]) => (
                <text
                  key={label as string}
                  x={Number(x) - 12}
                  y="128"
                  fontSize="7"
                  fill="#9ca3af"
                >
                  {label as string}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function OwnerDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<OwnerSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: OwnerSection; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "records",
      label: "Pet Medical Records",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "sales",
      label: "Sales Reports",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
          <path
            d="M6 10l3 3 3-3 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <div className={`paw-dashboard-shell paw-staff-dashboard paw-owner-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      {/* Sidebar */}
      <aside className="paw-dashboard-sidebar w-64 bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-16">
          <button className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <img src={bigpawLogo} alt="BigPaw" className="h-9 object-contain" />
        </div>
        <div className="h-1 bg-orange-400" />
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                section === item.id
                  ? "bg-orange-400 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
            />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
          LOGOUT
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="paw-dashboard-header paw-staff-topbar bg-[#1a0a3c] h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0">
          <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <img src={bigpawLogo} alt="PawControl" className="paw-customer-brand" />
          <div className="relative">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-300 flex items-center justify-center overflow-hidden border-2 border-orange-400">
              <img
                src={asaPhoto}
                alt="Owner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{username}</span>
              <span className="text-gray-400 text-xs">Owner</span>
            </div>
          </div>
        </header>
        <div className="h-1 bg-orange-400 flex-shrink-0" />

        <main className="paw-dashboard-main flex-1 overflow-y-auto p-8">
          {section === "home" && <OwnerHomeSection username={username} />}
          {section === "records" && (
            <AdminPlaceholder title="Pet Medical Records" />
          )}
          {section === "sales" && <AdminSalesReports ownerView />}
          {section === "settings" && <AdminPlaceholder title="User Settings" />}
        </main>
      </div>
    </div>
  )
}

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type DashboardRole = 'customer' | 'clerk' | 'admin' | 'veterinarian' | 'owner';

export default function Dashboard({ role = 'customer' }: { role?: DashboardRole }) {
  const profiles: Record<DashboardRole, string> = {
    customer: 'Karina',
    clerk: 'Maloi',
    admin: 'Chaewon',
    veterinarian: 'Haerin',
    owner: 'Asa',
  };
  const username = profiles[role] ?? profiles.customer;
  const logout = () => window.location.assign('/');

  if (role === 'admin') return <AdminDashboard username={username} onLogout={logout} />;
  if (role === 'clerk') return <ClerkDashboard username={username} onLogout={logout} />;
  if (role === 'veterinarian') return <VeterinarianDashboard username={username} onLogout={logout} />;
  if (role === 'owner') return <OwnerDashboard username={username} onLogout={logout} />;
  return <DashboardHome username={username} onLogout={logout} />;
}

function DashboardHome({ username, onLogout }: { username: string; onLogout: () => void }) {
  return <CustomerDashboard username={username} onLogout={onLogout} />;
}
