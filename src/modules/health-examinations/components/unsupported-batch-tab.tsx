interface UnsupportedBatchTabProps {
  feature: string
}

/** Placeholder for a tab whose backend API does not exist yet. It renders no data and sends no request. */
export function UnsupportedBatchTab({ feature }: UnsupportedBatchTabProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground"
    >
      <p className="font-medium text-foreground">Chưa hỗ trợ</p>
      <p className="mt-1">
        {feature} chưa khả dụng vì backend chưa cung cấp API tương ứng.
      </p>
    </div>
  )
}
