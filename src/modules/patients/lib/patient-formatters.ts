import { PatientGender } from "../types"

/**
 * Format date string (YYYY-MM-DD or ISO) to Vietnamese display standard DD/MM/YYYY.
 */
export function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === "") return "Chưa có"
  
  // If already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr
  }

  // Parse YYYY-MM-DD
  const parts = dateStr.split("T")[0].split("-")
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Calculate age from date of birth or birth year.
 */
export function calculatePatientAge(dateOfBirth?: string, birthYear?: number): number {
  if (dateOfBirth) {
    const parts = dateOfBirth.split("T")[0].split("-")
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const dob = new Date(year, month, day)
      if (!isNaN(dob.getTime())) {
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const m = today.getMonth() - dob.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--
        }
        if (age >= 0) return age
      }
    }
  }

  if (birthYear && birthYear > 1900) {
    return new Date().getFullYear() - birthYear
  }

  return 0
}

/**
 * Format Vietnamese phone number into 4-3-3 spacing: "0909 123 456"
 */
export function formatPhoneNumber(phoneNumber?: string): string {
  if (!phoneNumber) return ""
  const cleaned = phoneNumber.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phoneNumber
}

/**
 * Convert gender code to Vietnamese label
 */
export function getGenderLabel(gender?: PatientGender | string): string {
  switch (gender) {
    case "MALE":
      return "Nam"
    case "FEMALE":
      return "Nữ"
    case "OTHER":
      return "Khác"
    default:
      return "Chưa rõ"
  }
}
