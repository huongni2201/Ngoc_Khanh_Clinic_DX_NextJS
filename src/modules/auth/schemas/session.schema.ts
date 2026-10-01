import { z } from "zod"

const assignmentSchema = z.object({
  assignmentId: z.uuid(),
  roleCode: z.string(),
  permissions: z.array(z.string()),
  departmentId: z.uuid().nullable(),
  roomId: z.uuid().nullable(),
  validFrom: z.iso.datetime(),
  validTo: z.iso.datetime().nullable(),
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
  result: z.literal("OK"), code: z.literal(200), message: z.string(), data: userSessionSchema,
})

export const csrfEnvelopeSchema = z.object({
  result: z.literal("OK"), code: z.literal(200), message: z.string(),
  data: z.object({ token: z.string().min(1), headerName: z.literal("X-XSRF-TOKEN") }),
})
