import { afterEach, describe, expect, it, vi } from "vitest"
import {
  checkUsernameAvailability,
  createUserAccount,
  fetchAssignableRoles,
  searchAccountOwnerCandidates,
} from "../api/user-accounts-api"
import {
  GP_ROLE_ID,
  PATIENT_OWNER_ID,
  STAFF_OWNER_ID,
  createRequestBody,
  mockUserAccountFetch,
} from "./user-account-fixtures"

afterEach(() => vi.unstubAllGlobals())

describe("user accounts API", () => {
  it("reads the assignable roles and maps a null description to undefined", async () => {
    mockUserAccountFetch()

    const roles = await fetchAssignableRoles()

    expect(roles.map((role) => role.code)).toEqual(["GENERAL_PRACTITIONER", "NURSE"])
    expect(roles[1].description).toBeUndefined()
  })

  it("searches owner candidates by account type and keyword", async () => {
    const fetchMock = mockUserAccountFetch()

    const result = await searchAccountOwnerCandidates("PATIENT", "Lê Thị")

    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.pathname).toBe("/api/v1/user-accounts/owner-candidates")
    expect(url.searchParams.get("accountType")).toBe("PATIENT")
    expect(url.searchParams.get("keyword")).toBe("Lê Thị")
    expect(result.limited).toBe(false)
    expect(result.items[0]).toMatchObject({
      ownerId: PATIENT_OWNER_ID,
      dateOfBirth: "1990-03-14",
      departmentName: undefined,
    })
  })

  it("checks username availability", async () => {
    mockUserAccountFetch({ takenUsernames: ["taken"] })

    await expect(checkUsernameAvailability("taken")).resolves.toBe(false)
    await expect(checkUsernameAvailability("free")).resolves.toBe(true)
  })

  it("sends the staff roles and never sends roles for a patient account", async () => {
    const fetchMock = mockUserAccountFetch()

    await createUserAccount({
      accountType: "PATIENT",
      ownerId: PATIENT_OWNER_ID,
      username: "le.thi.hoa",
      temporaryPassword: "abc",
      roleIds: [GP_ROLE_ID],
    })

    expect(createRequestBody(fetchMock)).toEqual({
      accountType: "PATIENT",
      ownerId: PATIENT_OWNER_ID,
      username: "le.thi.hoa",
      temporaryPassword: "abc",
      roleIds: [],
    })
  })

  it("returns the created account without the password", async () => {
    mockUserAccountFetch({ smsDelivered: true })

    const created = await createUserAccount({
      accountType: "STAFF",
      ownerId: STAFF_OWNER_ID,
      username: "nguyen.van.a",
      temporaryPassword: "abc",
      roleIds: [GP_ROLE_ID],
    })

    expect(created).toEqual({
      accountId: expect.any(String),
      accountType: "STAFF",
      username: "nguyen.van.a",
      status: "ACTIVE",
      ownerId: STAFF_OWNER_ID,
      roleCodes: ["GENERAL_PRACTITIONER"],
      smsDelivered: true,
    })
  })
})
