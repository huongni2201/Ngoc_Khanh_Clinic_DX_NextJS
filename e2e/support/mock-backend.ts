import { expect, type Page, type Route } from "@playwright/test"
import { PERMISSION } from "../../src/modules/accesscontrol/permissions"

/**
 * In-browser stand-in for the backend contract, used only by the `chromium` Playwright project.
 * It is stateful: agreements, Participants, sessions and assignments behave like the real
 * endpoints (a stale `rowVersion` is a 409, a repeated open session slot is a 409, a Participant
 * is in a session at most once), and every request is recorded so a spec can assert what the UI
 * did NOT send. Rules the screens must not repeat (capacity does not exist, attendance comes from
 * the assignments) are enforced here the way the backend enforces them.
 */
export const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
export const ORGANIZATION_ID = "0199aaaa-0000-7000-8000-000000000001"

export const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
export const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Idempotency-Key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Disposition, Retry-After",
}

const CATALOG = [
  { id: "0199bbbb-0000-7000-8000-000000000001", code: "LOCAL_SVC_CONSULT", name: "Khám tổng quát", serviceType: "CONSULTATION", unitPrice: 150000, active: true },
  { id: "0199bbbb-0000-7000-8000-000000000002", code: "LOCAL_SVC_LAB_BLOOD", name: "Xét nghiệm công thức máu", serviceType: "LAB", unitPrice: 90000, active: true },
]

export type AgreementStatus = "DRAFT" | "ACTIVE" | "ENDED"
export type AssignmentStatus = "ASSIGNED" | "ATTENDED" | "NO_SHOW" | "MOVED" | "CANCELLED"

export interface MockAgreementService {
  id: string
  serviceId: string
  negotiatedPrice: number
  active: boolean
  rowVersion: number
}

export interface MockAgreement {
  id: string
  code: string
  name: string
  validFrom: string | null
  validTo: string | null
  status: AgreementStatus
  rowVersion: number
  services: MockAgreementService[]
}

export interface MockParticipant {
  id: string
  agreementId: string
  code: string | null
  fullName: string
  identificationNumber: string
  departmentName: string
  positionName: string
  rosterStatus: "ACTIVE" | "CANCELLED"
  rowVersion: number
  /** Agreement service ids recorded as performed. */
  performed: string[]
  source: "IMPORT" | "MANUAL"
}

export interface MockSession {
  id: string
  agreementId: string | null
  sessionDate: string
  activity: "ALL" | "SAMPLING" | "EXAMINATION"
  siteType: "CLINIC" | "ORGANIZATION_SITE"
  siteAddress: string
  status: "OPEN" | "CANCELLED"
  rowVersion: number
}

export interface MockAssignment {
  id: string
  participantId: string
  sessionId: string
  status: AssignmentStatus
  replacedBy: string | null
  attendedAt: string | null
  note: string | null
  rowVersion: number
}

export interface RecordedRequest {
  method: string
  path: string
  search: string
  /** Parsed JSON body of a POST or PUT; absent for a file upload. */
  body?: unknown
}

export interface MockBackend {
  requests: RecordedRequest[]
  /** Requests no handler recognized; a spec can assert it stays empty. */
  unexpected: RecordedRequest[]
  agreements: MockAgreement[]
  participants: MockParticipant[]
  sessions: MockSession[]
  assignments: MockAssignment[]
  /** Idempotency keys of the Participant and examination detail imports, in order. */
  importKeys: string[]
  /** Names the next Participant import creates. */
  importNames: string[]
  /** Makes every agreement list call fail with this status until `clearListFailure`. */
  failList: (status: number) => void
  clearListFailure: () => void
  /** Makes the next agreement update fail with 409, as if someone else saved first. */
  conflictNextUpdate: () => void
  /** Makes the next agreement delete fail with 409. */
  conflictNextDelete: () => void
  /** Makes the next request that matches fail with this status and message. */
  failNext: (method: string, path: RegExp, status: number, message: string) => void
  seedAgreement: (partial?: Partial<MockAgreement>) => MockAgreement
  seedParticipant: (agreement: MockAgreement, partial?: Partial<MockParticipant>) => MockParticipant
  seedSession: (partial?: Partial<MockSession>) => MockSession
  /** Puts a Participant in a session without going through the screens. */
  seedAssignment: (
    participant: MockParticipant,
    session: MockSession,
    status?: AssignmentStatus
  ) => MockAssignment
}

export interface MockBackendOptions {
  /** Permissions of the signed-in STAFF account. Every permission the frontend knows by default. */
  permissions?: readonly string[]
}

export const ALL_PERMISSIONS: readonly string[] = Object.values(PERMISSION)

function sessionBody(permissions: readonly string[]) {
  const now = Date.now()
  return {
    principalType: "STAFF",
    userId: "11111111-1111-4111-8111-111111111111",
    staffId: "22222222-2222-4222-8222-222222222222",
    patientId: null,
    username: "staff.test",
    roleAssignments: [{
      roleId: "33333333-3333-4333-8333-333333333333",
      roleCode: "CLINIC_MANAGER",
      permissions: [...permissions],
    }],
    idleExpiresAt: new Date(now + 30 * 60_000).toISOString(),
    absoluteExpiresAt: new Date(now + 8 * 3600_000).toISOString(),
  }
}

function organization() {
  return {
    id: ORGANIZATION_ID,
    name: "Đơn vị kiểm thử E2E",
    taxCode: null,
    phone: "0900000001",
    email: "org@example.invalid",
    address: "1 Đường Kiểm Thử, Hà Nội",
    contactFullName: "Người liên hệ",
    contactPhone: "0900000002",
    contactEmail: "contact@example.invalid",
    status: "ACTIVE",
    rowVersion: 1,
  }
}

function envelope(route: Route, status: number, data?: unknown, message = "Test response") {
  return route.fulfill({
    status,
    headers: CORS,
    contentType: "application/json",
    body: status === 204 ? undefined : JSON.stringify({ result: status < 300 ? "OK" : "NG", code: status, message, data: data ?? null }),
  })
}

function file(route: Route, contentType: string, name: string, bytes: string) {
  return route.fulfill({
    status: 200,
    headers: { ...CORS, "Content-Type": contentType, "Content-Disposition": `attachment; filename="${name}"` },
    body: Buffer.from(bytes),
  })
}

const pad = (value: number) => String(value).padStart(12, "0")
const today = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function page<T>(items: T[], url: URL, size = 10) {
  const number = Math.max(1, Number(url.searchParams.get("page") ?? 1))
  const pageSize = Number(url.searchParams.get("size") ?? size)
  const start = (number - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: number,
    size: pageSize,
    totalElements: items.length,
    totalPages: items.length ? Math.ceil(items.length / pageSize) : 0,
  }
}

export async function mockBackend(page_: Page, options: MockBackendOptions = {}): Promise<MockBackend> {
  const permissions = options.permissions ?? ALL_PERMISSIONS
  // Existing business-flow tests start with a previously authenticated browser.
  await page_.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  let sequence = 0
  const nextId = (prefix: string) => `${prefix}-0000-7000-8000-${pad((sequence += 1))}`

  let listFailure: number | null = null
  let updateConflict = false
  let deleteConflict = false
  const failures: { method: string; path: RegExp; status: number; message: string }[] = []

  const state: MockBackend = {
    requests: [],
    unexpected: [],
    agreements: [],
    participants: [],
    sessions: [],
    assignments: [],
    importKeys: [],
    importNames: ["Người khám 1", "Người khám 2"],
    failList: (status) => { listFailure = status },
    clearListFailure: () => { listFailure = null },
    conflictNextUpdate: () => { updateConflict = true },
    conflictNextDelete: () => { deleteConflict = true },
    failNext: (method, path, status, message) => { failures.push({ method, path, status, message }) },
    seedAgreement: (partial = {}) => {
      const index = state.agreements.length + 1
      const agreement: MockAgreement = {
        id: nextId("0199cccc"),
        code: `SEED-${index}`,
        name: `Thỏa thuận có sẵn ${index}`,
        validFrom: "2026-10-01",
        validTo: "2026-12-31",
        status: "DRAFT",
        rowVersion: 0,
        services: [{ id: nextId("0199c1c1"), serviceId: CATALOG[0].id, negotiatedPrice: 150000, active: true, rowVersion: 0 }],
        ...partial,
      }
      state.agreements.push(agreement)
      return agreement
    },
    seedParticipant: (agreement, partial = {}) => {
      const index = state.participants.filter((entry) => entry.agreementId === agreement.id).length + 1
      const participant: MockParticipant = {
        id: nextId("0199dddd"),
        agreementId: agreement.id,
        code: `NV${String(index).padStart(3, "0")}`,
        fullName: `Người khám ${index}`,
        identificationNumber: `0123456789${String(index).padStart(2, "0")}`,
        departmentName: "Phòng Kế toán",
        positionName: "Kế toán viên",
        rosterStatus: "ACTIVE",
        rowVersion: 0,
        performed: [],
        source: "IMPORT",
        ...partial,
      }
      state.participants.push(participant)
      return participant
    },
    seedSession: (partial = {}) => {
      const session: MockSession = {
        id: nextId("0199eeee"),
        agreementId: null,
        sessionDate: "2026-10-20",
        activity: "ALL",
        siteType: "CLINIC",
        siteAddress: "",
        status: "OPEN",
        rowVersion: 0,
        ...partial,
      }
      state.sessions.push(session)
      return session
    },
    seedAssignment: (participant, session, status = "ASSIGNED") => {
      const assignment: MockAssignment = {
        id: nextId("0199ffff"),
        participantId: participant.id,
        sessionId: session.id,
        status,
        replacedBy: null,
        attendedAt: status === "ATTENDED" ? `${session.sessionDate}T02:00:00Z` : null,
        note: null,
        rowVersion: 0,
      }
      state.assignments.push(assignment)
      return assignment
    },
  }

  // --- Views of the stored state, shaped like the backend responses ---

  const serviceName = (serviceId: string) => CATALOG.find((entry) => entry.id === serviceId)
  const sessionOf = (assignment: MockAssignment) => state.sessions.find((entry) => entry.id === assignment.sessionId)!
  const liveOf = (participantId: string) =>
    state.assignments.filter(
      (entry) => entry.participantId === participantId && (entry.status === "ASSIGNED" || entry.status === "ATTENDED")
    )
  const byDate = (left: MockAssignment, right: MockAssignment) =>
    sessionOf(left).sessionDate.localeCompare(sessionOf(right).sessionDate)

  function attendanceOf(participant: MockParticipant) {
    const own = state.assignments.filter((entry) => entry.participantId === participant.id)
    if (own.some((entry) => entry.status === "ATTENDED")) return "ATTENDED"
    if (own.some((entry) => entry.status === "NO_SHOW") && !own.some((entry) => entry.status === "ASSIGNED")) {
      return "NO_SHOW"
    }
    return "UNCONFIRMED"
  }

  function schedule(participant: MockParticipant) {
    const live = liveOf(participant.id)
    const waiting = live.filter((entry) => entry.status === "ASSIGNED").sort(byDate)
    const attended = live.filter((entry) => entry.status === "ATTENDED").sort(byDate)
    return {
      liveAssignmentCount: live.length,
      nextSessionDate: waiting[0] ? sessionOf(waiting[0]).sessionDate : null,
      lastAttendedDate: attended.at(-1) ? sessionOf(attended.at(-1)!).sessionDate : null,
    }
  }

  const reconciliationOf = (participant: MockParticipant) => (participant.performed.length ? "RECONCILED" : "PENDING")

  function agreementDetail(agreement: MockAgreement) {
    return {
      id: agreement.id,
      organizationId: ORGANIZATION_ID,
      agreementCode: agreement.code,
      agreementName: agreement.name,
      validFrom: agreement.validFrom,
      validTo: agreement.validTo,
      status: agreement.status,
      createdBy: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      rowVersion: agreement.rowVersion,
      services: agreement.services.map((service, index) => {
        const item = serviceName(service.serviceId)
        return {
          id: service.id,
          serviceId: service.serviceId,
          serviceCode: item?.code ?? null,
          serviceName: item?.name ?? null,
          referencePriceSnapshot: item?.unitPrice ?? 0,
          negotiatedPrice: service.negotiatedPrice,
          displayOrder: index + 1,
          active: service.active,
          rowVersion: service.rowVersion,
        }
      }),
    }
  }

  function agreementSummary(agreement: MockAgreement) {
    const { id, agreementCode, agreementName, validFrom, validTo, status, createdAt, updatedAt, rowVersion } =
      agreementDetail(agreement)
    return { id, agreementCode, agreementName, validFrom, validTo, status, createdAt, updatedAt, rowVersion }
  }

  function participantSummary(participant: MockParticipant) {
    return {
      id: participant.id,
      agreementId: participant.agreementId,
      participantCode: participant.code,
      fullName: participant.fullName,
      dateOfBirth: "1990-03-14",
      sex: "FEMALE",
      identificationNumberMasked: `********${participant.identificationNumber.slice(-4)}`,
      departmentName: participant.departmentName,
      positionName: participant.positionName,
      rosterStatus: participant.rosterStatus,
      attendanceStatus: attendanceOf(participant),
      reconciliationStatus: reconciliationOf(participant),
      ...schedule(participant),
      preparedAt: null,
      rowVersion: participant.rowVersion,
    }
  }

  function participantDetail(participant: MockParticipant) {
    const { liveAssignmentCount, nextSessionDate, lastAttendedDate, ...base } = participantSummary(participant)
    void liveAssignmentCount
    void nextSessionDate
    void lastAttendedDate
    return {
      ...base,
      identificationNumber: participant.identificationNumber,
      phone: null,
      email: null,
      patientLinked: false,
      source: participant.source,
      assignments: state.assignments
        .filter((entry) => entry.participantId === participant.id)
        .sort((left, right) => byDate(right, left))
        .map((entry) => {
          const session = sessionOf(entry)
          return {
            assignmentId: entry.id,
            sessionId: session.id,
            sessionDate: session.sessionDate,
            activity: session.activity,
            siteType: session.siteType,
            siteAddress: session.siteAddress || null,
            sessionStatus: session.status,
            status: entry.status,
            replacedByAssignmentId: entry.replacedBy,
            attendedAt: entry.attendedAt,
            note: entry.note,
            rowVersion: entry.rowVersion,
          }
        }),
      createdAt: "2026-10-07T01:00:00Z",
      updatedAt: "2026-10-07T01:00:00Z",
    }
  }

  function sessionView(session: MockSession) {
    const own = state.assignments.filter((entry) => entry.sessionId === session.id)
    return {
      id: session.id,
      organizationId: ORGANIZATION_ID,
      agreementId: session.agreementId,
      sessionDate: session.sessionDate,
      activity: session.activity,
      siteType: session.siteType,
      siteAddress: session.siteAddress,
      status: session.status,
      assignedCount: own.filter((entry) => entry.status === "ASSIGNED" || entry.status === "ATTENDED").length,
      attendedCount: own.filter((entry) => entry.status === "ATTENDED").length,
      noShowCount: own.filter((entry) => entry.status === "NO_SHOW").length,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      rowVersion: session.rowVersion,
    }
  }

  const assignmentView = (assignment: MockAssignment) => ({
    id: assignment.id,
    participantId: assignment.participantId,
    sessionId: assignment.sessionId,
    status: assignment.status,
    replacedByAssignmentId: assignment.replacedBy,
    attendedAt: assignment.attendedAt,
    note: assignment.note,
    rowVersion: assignment.rowVersion,
  })

  function assignmentRow(assignment: MockAssignment) {
    const participant = state.participants.find((entry) => entry.id === assignment.participantId)!
    return {
      assignmentId: assignment.id,
      status: assignment.status,
      attendedAt: assignment.attendedAt,
      note: assignment.note,
      assignmentRowVersion: assignment.rowVersion,
      participantId: participant.id,
      agreementId: participant.agreementId,
      participantCode: participant.code,
      fullName: participant.fullName,
      dateOfBirth: "1990-03-14",
      sex: "FEMALE",
      identificationNumberMasked: `********${participant.identificationNumber.slice(-4)}`,
      departmentName: participant.departmentName,
      positionName: participant.positionName,
      rosterStatus: participant.rosterStatus,
    }
  }

  const activeRoster = (agreementId: string) =>
    state.participants.filter((entry) => entry.agreementId === agreementId && entry.rosterStatus === "ACTIVE")

  function covers(session: MockSession, activity: string) {
    return session.activity === "ALL" || session.activity === activity
  }

  function paymentReport(agreement: MockAgreement, url: URL) {
    const roster = activeRoster(agreement.id)
    const visits = state.assignments.filter(
      (entry) => entry.status === "ATTENDED" && roster.some((person) => person.id === entry.participantId)
    )
    const items = agreement.services.map((service, index) => {
      const item = serviceName(service.serviceId)
      const examinedCount = roster.filter((person) => person.performed.includes(service.id)).length
      return {
        agreementServiceId: service.id,
        serviceCode: item?.code ?? null,
        serviceName: item?.name ?? null,
        displayOrder: index + 1,
        unitPrice: service.negotiatedPrice,
        examinedCount,
        amount: examinedCount * service.negotiatedPrice,
      }
    })
    return {
      agreementId: agreement.id,
      agreementCode: agreement.code,
      agreementName: agreement.name,
      agreementStatus: agreement.status,
      validFrom: agreement.validFrom,
      validTo: agreement.validTo,
      rangeFrom: url.searchParams.get("from"),
      rangeTo: url.searchParams.get("to"),
      provisional: agreement.status !== "ENDED",
      registeredCount: roster.length,
      attendedCount: roster.filter((person) => attendanceOf(person) === "ATTENDED").length,
      reconciledCount: roster.filter((person) => reconciliationOf(person) === "RECONCILED").length,
      sessionCount: new Set(visits.map((entry) => entry.sessionId)).size,
      visitCount: visits.length,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
      generatedAt: new Date().toISOString(),
    }
  }

  await page_.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const path = url.pathname
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS })

    let body: Record<string, unknown> | undefined
    if (method === "POST" || method === "PUT") {
      try {
        body = request.postDataJSON() as Record<string, unknown>
      } catch {
        body = undefined // multipart upload
      }
    }
    state.requests.push({ method, path, search: url.search, body })

    const failureIndex = failures.findIndex((entry) => entry.method === method && entry.path.test(path))
    if (failureIndex !== -1) {
      const [failure] = failures.splice(failureIndex, 1)
      return envelope(route, failure.status, undefined, failure.message)
    }

    if (path === "/api/v1/auth/me") return envelope(route, 200, sessionBody(permissions))
    if (path === "/api/v1/catalog/services") {
      return envelope(route, 200, { items: CATALOG, page: 1, size: 100, totalElements: CATALOG.length, totalPages: 1 })
    }
    if (path === "/api/v1/organizations" && method === "GET") {
      return envelope(route, 200, { items: [organization()], page: 1, size: 10, totalElements: 1, totalPages: 1 })
    }
    if (path === `/api/v1/organizations/${ORGANIZATION_ID}` && method === "GET") return envelope(route, 200, organization())

    const orgBase = `/api/v1/organizations/${ORGANIZATION_ID}`
    const stale = (version: unknown, current: number) => version !== current

    // --- Document render jobs (bulk print) ---
    if (path === "/api/v1/document-render-jobs/job-1" && method === "GET") {
      return envelope(route, 200, {
        id: "job-1",
        documentType: "HEALTH_EXAM_PERIODIC_FORM_BLANK",
        status: "SUCCEEDED",
        totalCount: 2,
        processedCount: 2,
        errorCode: null,
        skipped: [],
        parts: [{ partNo: 1, recordCount: 2, sizeBytes: 1_200_000 }],
        createdAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
      })
    }
    if (path === "/api/v1/document-render-jobs/job-1/parts/1") {
      return file(route, "application/pdf", "phieu-kham-phan-1.pdf", "%PDF-1.7")
    }

    // --- Sessions and assignments ---
    const sessionsPath = `${orgBase}/sessions`
    if (path === sessionsPath && method === "GET") {
      const agreementId = url.searchParams.get("agreementId")
      const status = url.searchParams.get("status")
      const activity = url.searchParams.get("activity")
      const from = url.searchParams.get("from")
      const to = url.searchParams.get("to")
      const direction = url.searchParams.get("sortBy") === "DESC" ? -1 : 1
      const items = state.sessions
        .filter((session) => !agreementId || session.agreementId === agreementId || session.agreementId === null)
        .filter((session) => !status || session.status === status)
        .filter((session) => !activity || session.activity === activity)
        .filter((session) => !from || session.sessionDate >= from)
        .filter((session) => !to || session.sessionDate <= to)
        .sort((left, right) => direction * left.sessionDate.localeCompare(right.sessionDate))
      return envelope(route, 200, page(items.map(sessionView), url))
    }
    if (path === sessionsPath && method === "POST") {
      const input = body as Record<string, string | undefined>
      const duplicate = state.sessions.some(
        (session) =>
          session.status === "OPEN" &&
          session.sessionDate === input.sessionDate &&
          session.siteType === input.siteType &&
          session.siteAddress === (input.siteAddress ?? "") &&
          session.activity === input.activity
      )
      if (duplicate) return envelope(route, 409, undefined, "Session already exists")
      const created = state.seedSession({
        agreementId: input.agreementId ?? null,
        sessionDate: String(input.sessionDate),
        activity: input.activity as MockSession["activity"],
        siteType: input.siteType as MockSession["siteType"],
        siteAddress: input.siteAddress ?? "",
      })
      return envelope(route, 201, sessionView(created))
    }
    const sessionMatch = path.match(new RegExp(`^${sessionsPath}/([^/]+)(?:/(cancel))?$`))
    if (sessionMatch) {
      const session = state.sessions.find((entry) => entry.id === sessionMatch[1])
      if (!session) return envelope(route, 404, undefined, "Session not found")
      if (method === "GET") return envelope(route, 200, sessionView(session))
      if (stale(body?.rowVersion, session.rowVersion)) {
        return envelope(route, 409, undefined, "Record was changed by another request")
      }
      if (sessionMatch[2] === "cancel" && method === "POST") {
        if (state.assignments.some((entry) => entry.sessionId === session.id && (entry.status === "ASSIGNED" || entry.status === "ATTENDED"))) {
          return envelope(route, 409, undefined, "Session still has Participants")
        }
        session.status = "CANCELLED"
        session.rowVersion += 1
        return envelope(route, 200, sessionView(session))
      }
      if (method === "PUT") {
        Object.assign(session, {
          sessionDate: String(body?.sessionDate),
          activity: body?.activity,
          siteType: body?.siteType,
          siteAddress: String(body?.siteAddress ?? ""),
          rowVersion: session.rowVersion + 1,
        })
        return envelope(route, 200, sessionView(session))
      }
    }

    const assignmentsMatch = path.match(new RegExp(`^${sessionsPath}/([^/]+)/assignments(?:/([^/]+))?(?:/(move|cancel|attendance))?$`))
    if (assignmentsMatch) {
      const session = state.sessions.find((entry) => entry.id === assignmentsMatch[1])
      if (!session) return envelope(route, 404, undefined, "Session not found")
      const [, , second, third] = assignmentsMatch

      if (!second && method === "GET") {
        const status = url.searchParams.get("status")
        const keyword = (url.searchParams.get("searchKey") ?? "").toLowerCase()
        const rows = state.assignments
          .filter((entry) => entry.sessionId === session.id)
          .filter((entry) => !status || entry.status === status)
          .map(assignmentRow)
          .filter((row) => !keyword || row.fullName.toLowerCase().includes(keyword))
          .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"))
        return envelope(route, 200, page(rows, url, 20))
      }
      if (!second && method === "POST") {
        const ids = (body?.participantIds as string[]) ?? []
        const people = ids.map((id) => state.participants.find((entry) => entry.id === id))
        if (people.some((person) => !person)) return envelope(route, 404, undefined, "Participant not found")
        if (people.some((person) => person!.rosterStatus === "CANCELLED")) {
          return envelope(route, 409, undefined, "Participant is cancelled")
        }
        const assigned: { participantId: string; assignmentId: string }[] = []
        const skipped: string[] = []
        for (const person of people as MockParticipant[]) {
          if (liveOf(person.id).some((entry) => entry.sessionId === session.id)) {
            skipped.push(person.id)
            continue
          }
          const created = state.seedAssignment(person, session)
          assigned.push({ participantId: person.id, assignmentId: created.id })
        }
        return envelope(route, 201, { sessionId: session.id, assigned, skippedParticipantIds: skipped })
      }
      if (second === "move" && !third && method === "POST") {
        // Move every waiting Participant of the session; attended ones stay.
        const target = state.sessions.find((entry) => entry.id === body?.targetSessionId)
        if (!target || target.status !== "OPEN") return envelope(route, 409, undefined, "Target session is not open")
        let moved = 0
        const skipped: string[] = []
        for (const entry of state.assignments.filter((item) => item.sessionId === session.id && item.status === "ASSIGNED")) {
          if (liveOf(entry.participantId).some((item) => item.sessionId === target.id)) {
            skipped.push(entry.participantId)
            continue
          }
          const replacement = state.seedAssignment(state.participants.find((item) => item.id === entry.participantId)!, target)
          entry.status = "MOVED"
          entry.replacedBy = replacement.id
          entry.rowVersion += 1
          moved += 1
        }
        return envelope(route, 200, {
          sourceSessionId: session.id,
          targetSessionId: target.id,
          movedCount: moved,
          skippedParticipantIds: skipped,
        })
      }
      const assignment = state.assignments.find((entry) => entry.id === second && entry.sessionId === session.id)
      if (second && !assignment) return envelope(route, 404, undefined, "Assignment not found")
      if (assignment && third && method === "POST") {
        if (stale(body?.rowVersion, assignment.rowVersion)) {
          return envelope(route, 409, undefined, "Record was changed by another request")
        }
        if (third === "move") {
          const target = state.sessions.find((entry) => entry.id === body?.targetSessionId)
          if (!target || target.status !== "OPEN") return envelope(route, 409, undefined, "Target session is not open")
          if (assignment.status !== "ASSIGNED") return envelope(route, 409, undefined, "Assignment cannot be moved")
          if (liveOf(assignment.participantId).some((entry) => entry.sessionId === target.id)) {
            return envelope(route, 409, undefined, "Participant already in session")
          }
          const replacement = state.seedAssignment(state.participants.find((entry) => entry.id === assignment.participantId)!, target)
          assignment.status = "MOVED"
          assignment.replacedBy = replacement.id
          assignment.rowVersion += 1
          return envelope(route, 200, assignmentView(replacement))
        }
        if (third === "cancel") {
          if (assignment.status !== "ASSIGNED") return envelope(route, 409, undefined, "Assignment cannot be cancelled")
          assignment.status = "CANCELLED"
          assignment.note = typeof body?.note === "string" ? body.note : null
          assignment.rowVersion += 1
          return envelope(route, 200, assignmentView(assignment))
        }
        if (third === "attendance") {
          const wanted = body?.status as AssignmentStatus
          if (wanted === "ATTENDED" && session.sessionDate > today()) {
            return envelope(route, 409, undefined, "Session has not started")
          }
          assignment.status = wanted
          assignment.attendedAt = wanted === "ATTENDED" ? new Date().toISOString() : null
          assignment.rowVersion += 1
          return envelope(route, 200, assignmentView(assignment))
        }
      }
    }

    // --- Agreements ---
    const agreementsPath = `${orgBase}/agreements`
    if (path === agreementsPath && method === "GET") {
      if (listFailure !== null) return envelope(route, listFailure, undefined, "Forbidden by test")
      const keyword = (url.searchParams.get("searchKey") ?? "").toLowerCase()
      const items = state.agreements
        .filter((agreement) => !keyword || agreement.code.toLowerCase().includes(keyword) || agreement.name.toLowerCase().includes(keyword))
        .map(agreementSummary)
      return envelope(route, 200, page(items, url))
    }
    if (path === agreementsPath && method === "POST") {
      expect(request.headers().origin).toBe("http://localhost:3000")
      // The backend generates the code (KSK-<year>-<running number>) and never accepts one.
      expect(body).not.toHaveProperty("agreementCode")
      const created = state.seedAgreement({
        code: `KSK-2026-${String(state.agreements.length + 1).padStart(3, "0")}`,
        name: String(body?.agreementName),
        validFrom: (body?.validFrom as string | null) ?? null,
        validTo: (body?.validTo as string | null) ?? null,
        services: ((body?.services as { serviceId: string; negotiatedPrice: number }[]) ?? []).map((service) => ({
          id: nextId("0199c1c1"),
          serviceId: service.serviceId,
          negotiatedPrice: service.negotiatedPrice,
          active: true,
          rowVersion: 0,
        })),
      })
      return envelope(route, 201, agreementDetail(created))
    }

    const itemMatch = path.match(new RegExp(`^${agreementsPath}/([^/]+)(/.*)?$`))
    if (itemMatch) {
      const agreement = state.agreements.find((entry) => entry.id === itemMatch[1])
      if (!agreement) return envelope(route, 404, undefined, "Agreement not found")
      const rest = itemMatch[2] ?? ""

      if (rest === "") {
        if (method === "GET") return envelope(route, 200, agreementDetail(agreement))
        expect(request.headers().origin).toBe("http://localhost:3000")
        if (method === "PUT") {
          if (updateConflict || stale(body?.rowVersion, agreement.rowVersion)) {
            updateConflict = false
            // The "other user" saved first: the stored version moves on.
            agreement.rowVersion += 1
            agreement.name = `${agreement.name} (đã sửa bởi người khác)`
            return envelope(route, 409, undefined, "Record was changed by another request")
          }
          const services = (body?.services as { serviceId: string; negotiatedPrice: number }[]) ?? []
          Object.assign(agreement, {
            name: String(body?.agreementName),
            validFrom: (body?.validFrom as string | null) ?? null,
            validTo: (body?.validTo as string | null) ?? null,
            rowVersion: agreement.rowVersion + 1,
            services: services.map((service) => ({
              id: agreement.services.find((entry) => entry.serviceId === service.serviceId)?.id ?? nextId("0199c1c1"),
              serviceId: service.serviceId,
              negotiatedPrice: service.negotiatedPrice,
              active: true,
              rowVersion: 0,
            })),
          })
          return envelope(route, 200, agreementDetail(agreement))
        }
        if (method === "DELETE") {
          if (deleteConflict || url.searchParams.get("rowVersion") !== String(agreement.rowVersion)) {
            deleteConflict = false
            agreement.status = "ACTIVE"
            agreement.rowVersion += 1
            return envelope(route, 409, undefined, "Agreement is not deletable")
          }
          state.agreements = state.agreements.filter((entry) => entry.id !== agreement.id)
          return envelope(route, 204)
        }
      }

      if (method === "POST" && ["/activate", "/end"].includes(rest)) {
        if (stale(body?.rowVersion, agreement.rowVersion)) {
          return envelope(route, 409, undefined, "Record was changed by another request")
        }
        if (rest === "/activate") {
          if (agreement.status !== "DRAFT") return envelope(route, 409, undefined, "Agreement is not a draft")
          agreement.status = "ACTIVE"
        } else {
          if (agreement.status !== "ACTIVE") return envelope(route, 409, undefined, "Agreement is not active")
          agreement.status = "ENDED"
        }
        agreement.rowVersion += 1
        return envelope(route, 200, agreementDetail(agreement))
      }

      // --- Participants ---
      const participantsPath = "/participants"
      if (rest === participantsPath && method === "GET") {
        const keyword = (url.searchParams.get("searchKey") ?? "").toLowerCase()
        const cccd = url.searchParams.get("identificationNumber")
        const roster = url.searchParams.get("rosterStatus")
        const attendance = url.searchParams.get("attendanceStatus")
        const reconciliation = url.searchParams.get("reconciliationStatus")
        const inSession = url.searchParams.get("sessionId")
        const unscheduledFor = url.searchParams.get("unscheduledFor")
        const items = state.participants
          .filter((entry) => entry.agreementId === agreement.id)
          .filter((entry) => !keyword || entry.fullName.toLowerCase().includes(keyword) || (entry.code ?? "").toLowerCase().includes(keyword))
          .filter((entry) => !cccd || entry.identificationNumber === cccd)
          .filter((entry) => !roster || entry.rosterStatus === roster)
          .filter((entry) => !attendance || attendanceOf(entry) === attendance)
          .filter((entry) => !reconciliation || reconciliationOf(entry) === reconciliation)
          .filter((entry) => !inSession || liveOf(entry.id).some((item) => item.sessionId === inSession))
          .filter((entry) => {
            if (!unscheduledFor) return true
            const live = liveOf(entry.id)
            if (unscheduledFor === "ANY") return live.length === 0
            return !live.some((item) => covers(sessionOf(item), unscheduledFor))
          })
        return envelope(route, 200, page(items.map(participantSummary), url))
      }
      if (rest === participantsPath && method === "POST") {
        if (agreement.status === "ENDED") return envelope(route, 409, undefined, "Agreement does not accept Participant changes")
        const input = body as Record<string, string>
        if (state.participants.some((entry) => entry.agreementId === agreement.id && entry.identificationNumber === input.identificationNumber)) {
          return envelope(route, 409, undefined, "Participant identity already exists in this agreement")
        }
        const created = state.seedParticipant(agreement, {
          code: null,
          fullName: input.fullName,
          identificationNumber: input.identificationNumber,
          departmentName: input.departmentName,
          positionName: input.positionName,
          source: "MANUAL",
        })
        return envelope(route, 201, participantDetail(created))
      }
      if (rest === `${participantsPath}/import-template`) {
        return file(route, XLSX, "participants-template.xlsx", "PK-fake-xlsx")
      }
      if (rest === `${participantsPath}/imports` && method === "POST") {
        state.importKeys.push(request.headers()["idempotency-key"] ?? "")
        if (agreement.status === "ENDED") return envelope(route, 409, undefined, "Agreement does not accept Participant imports")
        for (const [index, name] of state.importNames.entries()) {
          state.seedParticipant(agreement, { fullName: name, identificationNumber: `09876543${String(state.participants.length + index).padStart(4, "0")}` })
        }
        return envelope(route, 201, {
          importJobId: "0199ffff-0000-7000-8000-000000000001",
          agreementId: agreement.id,
          totalRows: state.importNames.length,
          createdCount: state.importNames.length,
          completedAt: new Date().toISOString(),
        })
      }
      if (rest === `${participantsPath}/examination-form-print-jobs` && method === "POST") {
        return envelope(route, 202, { jobId: "job-1" })
      }
      const participantMatch = rest.match(/^\/participants\/([^/]+)(\/reactivate|\/examination-form)?$/)
      if (participantMatch) {
        const participant = state.participants.find((entry) => entry.id === participantMatch[1] && entry.agreementId === agreement.id)
        if (!participant) return envelope(route, 404, undefined, "Participant not found")
        if (participantMatch[2] === "/examination-form") return file(route, "application/pdf", "phieu-kham.pdf", "%PDF-1.7")
        if (participantMatch[2] === "/reactivate" && method === "POST") {
          if (participant.rosterStatus !== "CANCELLED") return envelope(route, 409, undefined, "Participant is not cancelled")
          participant.rosterStatus = "ACTIVE"
          participant.rowVersion += 1
          return envelope(route, 200, participantDetail(participant))
        }
        if (method === "GET") return envelope(route, 200, participantDetail(participant))
        if (method === "DELETE") {
          // Cancelling releases the sessions the Participant was waiting for.
          for (const entry of liveOf(participant.id).filter((item) => item.status === "ASSIGNED")) {
            entry.status = "CANCELLED"
            entry.rowVersion += 1
          }
          participant.rosterStatus = "CANCELLED"
          participant.rowVersion += 1
          return route.fulfill({ status: 204, headers: CORS })
        }
      }

      // --- Examination details and reports ---
      if (rest === "/examination-details/summary") {
        const roster = activeRoster(agreement.id)
        return envelope(route, 200, {
          registered: roster.length,
          unconfirmed: roster.filter((entry) => attendanceOf(entry) === "UNCONFIRMED").length,
          attended: roster.filter((entry) => attendanceOf(entry) === "ATTENDED").length,
          noShow: roster.filter((entry) => attendanceOf(entry) === "NO_SHOW").length,
          unscheduled: roster.filter((entry) => liveOf(entry.id).length === 0).length,
          reconciled: roster.filter((entry) => reconciliationOf(entry) === "RECONCILED").length,
          pendingReconciliation: roster.filter((entry) => reconciliationOf(entry) === "PENDING").length,
        })
      }
      if (rest === "/examination-details/export") return file(route, XLSX, `chi-tiet-kham-${agreement.code}.xlsx`, "PK-fake-xlsx")
      if (rest === "/examination-details/import-template") {
        return file(route, XLSX, `mau-nhap-chi-tiet-kham-${agreement.code}.xlsx`, "PK-fake-xlsx")
      }
      if (rest === "/examination-details/imports" && method === "POST") {
        state.importKeys.push(request.headers()["idempotency-key"] ?? "")
        const first = agreement.services.find((service) => service.active)
        const roster = activeRoster(agreement.id)
        for (const person of roster) if (first) person.performed = [first.id]
        return envelope(route, 201, {
          importJobId: "0199ffff-0000-7000-8000-000000000002",
          agreementId: agreement.id,
          totalRows: roster.length,
          updatedParticipants: roster.length,
          unchangedParticipants: 0,
          performedItems: roster.length,
          completedAt: new Date().toISOString(),
        })
      }
      const recordMatch = rest.match(/^\/examination-details\/([^/]+)$/)
      if (recordMatch && method === "PUT") {
        const participant = state.participants.find((entry) => entry.id === recordMatch[1] && entry.agreementId === agreement.id)
        if (!participant) return envelope(route, 404, undefined, "Participant not found")
        if (stale(body?.rowVersion, participant.rowVersion)) {
          return envelope(route, 409, undefined, "Participant was changed by another request; reload and try again")
        }
        participant.performed = (body?.performedAgreementServiceIds as string[]) ?? []
        participant.rowVersion += 1
        return envelope(route, 200, examinationRow(participant))
      }
      if (rest === "/examination-details" && method === "GET") {
        const roster = activeRoster(agreement.id)
        return envelope(route, 200, page(roster.map(examinationRow), url))
      }
      if (rest === "/reports/payment-summary/docx") return file(route, DOCX, `bao-cao-thanh-toan-${agreement.code}.docx`, "PK-fake-docx")
      if (rest === "/reports/payment-summary") return envelope(route, 200, paymentReport(agreement, url))
    }

    state.unexpected.push({ method, path, search: url.search })
    return envelope(route, 404, undefined, "Unexpected request in mock backend")
  })

  function examinationRow(participant: MockParticipant) {
    const { liveAssignmentCount, ...rest } = participantSummary(participant)
    void liveAssignmentCount
    return {
      id: rest.id,
      participantCode: rest.participantCode,
      fullName: rest.fullName,
      identificationNumberMasked: rest.identificationNumberMasked,
      departmentName: rest.departmentName,
      positionName: rest.positionName,
      nextSessionDate: rest.nextSessionDate,
      attendanceStatus: rest.attendanceStatus,
      lastAttendedDate: rest.lastAttendedDate,
      reconciliationStatus: rest.reconciliationStatus,
      performedAgreementServiceIds: participant.performed,
      rowVersion: participant.rowVersion,
    }
  }

  return state
}
