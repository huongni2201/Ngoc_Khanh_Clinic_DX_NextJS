// Characters that are easy to confuse when read from an SMS (0/O, 1/l/I) are left out.
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz"
const DIGITS = "23456789"
const SYMBOLS = "!@#$%&*?"
const ALL = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS

export const GENERATED_PASSWORD_LENGTH = 12

/** Uniform index below `max` from the platform CSPRNG, without modulo bias. */
function randomIndex(max: number, random: (buffer: Uint32Array) => Uint32Array): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buffer = new Uint32Array(1)
  for (;;) {
    random(buffer)
    if (buffer[0] < limit) return buffer[0] % max
  }
}

function pick(alphabet: string, random: (buffer: Uint32Array) => Uint32Array): string {
  return alphabet[randomIndex(alphabet.length, random)]
}

/**
 * Random temporary password for the Generate button: one character of each kind, the rest from the
 * whole alphabet, shuffled. The backend has no complexity policy; this only makes a strong default.
 */
export function generateTemporaryPassword(
  random: (buffer: Uint32Array) => Uint32Array = (buffer) => crypto.getRandomValues(buffer)
): string {
  const characters = [
    pick(UPPERCASE, random),
    pick(LOWERCASE, random),
    pick(DIGITS, random),
    pick(SYMBOLS, random),
  ]
  while (characters.length < GENERATED_PASSWORD_LENGTH) characters.push(pick(ALL, random))
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1, random)
    ;[characters[index], characters[swap]] = [characters[swap], characters[index]]
  }
  return characters.join("")
}
