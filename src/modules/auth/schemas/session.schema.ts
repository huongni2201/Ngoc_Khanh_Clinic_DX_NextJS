import { z } from "zod"

// Mirrors the backend UserPrincipal (accesscontrol::access, ADR-0014).
const assignmentSchema = z.object({
  roleId: z.uuid(),
  roleCode: z.string(),
  permissions: z.array(z.string()),
})

const sessionFields = {
  userId: z.uuid(), username: z.string(),
  roleAssignments: z.array(assignmentSchema),
  idleExpiresAt: z.iso.datetime(), absoluteExpiresAt: z.iso.datetime(),
}

export const userSessionSchema = z.discriminatedUnion("principalType", [
  z.object({ ...sessionFields, principalType: z.literal("STAFF"), staffId: z.uuid(), patientId: z.null() }),
  z.object({ ...sessionFields, principalType: z.literal("PATIENT"), staffId: z.null(), patientId: z.uuid() }),
])

export const sessionEnvelopeSchema = z.object({
  result: z.literal("OK"), code: z.literal(200), message: z.string().optional(), data: userSessionSchema,
})
