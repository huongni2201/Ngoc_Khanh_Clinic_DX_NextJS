/** Red asterisk for a required field, announced as "(bắt buộc)" to screen readers. */
export function RequiredMark() {
  return (
    <>
      {" "}
      <span aria-hidden="true" className="text-destructive">
        *
      </span>
      <span className="sr-only">(bắt buộc)</span>
    </>
  )
}
