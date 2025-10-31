import { AttractionDetailPage } from "@/features/attraction/AttractionDetailPage"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AttractionDetailPage id={id} />
}
