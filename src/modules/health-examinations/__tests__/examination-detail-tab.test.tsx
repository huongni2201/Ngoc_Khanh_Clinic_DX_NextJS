import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { ExaminationMatrixTable } from "../components/examination-detail-tab/examination-matrix-table"

describe("ExaminationMatrixTable", () => {
  it("renders configured columns and completed markers", () => {
    render(
      <ExaminationMatrixTable
        categoryColumns={[{ id: "cat-1", name: "Khám nội" }]}
        items={[
          {
            id: "participant-1",
            participantCode: "NV001",
            fullName: "Nguyễn Văn A",
            examinations: { "cat-1": "COMPLETED" },
            completedServiceIds: ["cat-1"],
            examStatus: "COMPLETED",
          },
        ]}
        totalItems={1}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={vi.fn()}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onToggleSelectAll={vi.fn()}
      />
    )

    expect(screen.getByText("Khám nội")).toBeInTheDocument()
    expect(screen.getByText("NV001")).toBeInTheDocument()
    expect(screen.getByText("X")).toBeInTheDocument()
  })
})
