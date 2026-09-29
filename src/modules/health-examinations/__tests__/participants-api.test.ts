import { describe, expect, it } from "vitest"
import {
  buildParticipantListUrl,
  mapParticipantPageResponse,
  type BatchParticipantPageResponse,
} from "../api/participants"

describe("participant roster API mapping", () => {
  it("builds the BE participant URL and maps its flat DTO", () => {
    const response: BatchParticipantPageResponse = {
      result: "OK",
      code: 200,
      message: "Health examination batch participants",
      data: {
        items: [
          {
            batchParticipantId: "batch-participant-1",
            participantId: "participant-1",
            participantCode: "NV001",
            departmentName: "Khối Công nghệ",
            jobTitle: "Kỹ sư",
            occupation: "Phát triển phần mềm",
            fullName: "Nguyễn Văn A",
            dateOfBirth: "1990-03-14",
            sex: "MALE",
            identificationNumber: "012345678901",
            identificationNumberIssueDate: null,
            identificationNumberIssuePlace: null,
            ethnicity: null,
            subjectType: "STUDENT",
            payerSource: "ORGANIZATION",
            bloodGroup: null,
            phone: "0901234567",
            province: "Hà Nội",
            ward: "Cầu Giấy",
            addressDetail: "10 Phạm Văn Bạch",
            administrativeOccupation: null,
            workplaceOrSchool: null,
            healthExaminationReason: "Khám định kỳ",
            status: "ACTIVE",
            createdAt: "2026-09-28T10:00:00Z",
          },
        ],
        page: 2,
        size: 10,
        totalElements: 11,
        totalPages: 2,
      },
    }

    expect(
      buildParticipantListUrl("org-1", "batch-1", {
        search: "Nguyễn",
        page: 2,
        pageSize: 10,
      })
    ).toBe(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/participant?page=2&size=10&searchKey=Nguy%E1%BB%85n&sortKey=id&sortBy=ASC"
    )

    expect(mapParticipantPageResponse(response, "batch-1")).toEqual({
      data: [
        {
          id: "batch-participant-1",
          batchId: "batch-1",
          participantCode: "NV001",
          participantType: "STUDENT",
          fullName: "Nguyễn Văn A",
          dateOfBirth: "1990-03-14",
          gender: "Nam",
          identificationNumber: "012345678901",
          phoneNumber: "0901234567",
          organizationUnit: "Khối Công nghệ",
          jobTitle: "Kỹ sư",
          address: "10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
          batchParticipantStatus: "ACTIVE",
        },
      ],
      total: 11,
      page: 2,
      pageSize: 10,
      totalPages: 2,
    })
  })
})
