import type { StaffSession } from "../types"

export const staffSession: StaffSession = {
  userId: "11111111-1111-4111-8111-111111111111",
  staffId: "22222222-2222-4222-8222-222222222222",
  username: "staff.test", principalType: "STAFF",
  roleAssignments: [{
    assignmentId: "33333333-3333-4333-8333-333333333333", roleCode: "STAFF",
    permissions: ["encounter.read"], departmentId: null, roomId: null,
    validFrom: "2026-01-01T00:00:00Z", validTo: null,
  }],
  idleExpiresAt: "2026-09-29T12:30:00Z", absoluteExpiresAt: "2026-09-29T20:00:00Z",
}

export function ok(data: unknown) {
  return Response.json({ result: "OK", code: 200, message: "Success", data })
}
export function csrf() {
  return ok({ token: "masked-token", headerName: "X-XSRF-TOKEN" })
}
