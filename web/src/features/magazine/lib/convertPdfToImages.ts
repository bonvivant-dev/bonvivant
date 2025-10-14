import { PDFPageImage } from '@/features/magazine/types'

async function convertPdfArrayBufferToImages(
  arrayBuffer: ArrayBuffer,
  maxPages?: number,
): Promise<PDFPageImage[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

  const uint8Array = new Uint8Array(arrayBuffer)
  const loadingTask = pdfjs.getDocument({ data: uint8Array })
  const pdfDocument = await loadingTask.promise

  const numPages = maxPages
    ? Math.min(pdfDocument.numPages, maxPages)
    : pdfDocument.numPages
  const pageImages: PDFPageImage[] = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.5 })

    // Canvas 생성
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height

    // PDF 페이지를 Canvas에 렌더링
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    // Canvas를 Blob과 DataURL로 변환
    const blob = (await new Promise<Blob>(resolve => {
      canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8)
    })) as Blob

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

    pageImages.push({
      blob,
      dataUrl,
      pageNumber: pageNum,
    })
  }

  return pageImages
}

export async function convertPdfToImages(
  file: File,
  maxPages?: number,
): Promise<PDFPageImage[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    return await convertPdfArrayBufferToImages(arrayBuffer, maxPages)
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    throw error
  }
}

export async function convertPdfFromStorage(
  storageKey: string,
  filename: string,
  maxPages?: number,
): Promise<PDFPageImage[]> {
  try {
    const { supabaseBrowserClient } = await import(
      '@/shared/utils/supabase/client'
    )

    const { data } = await supabaseBrowserClient.storage
      .from('magazines')
      .createSignedUrl(`${storageKey}/${filename}`, 60)

    if (!data?.signedUrl) {
      throw new Error('Failed to get public URL from Supabase')
    }

    console.log('Fetching PDF from URL:', data.signedUrl)

    const response = await fetch(data.signedUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF from storage: ${response.status} ${response.statusText}`,
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    return await convertPdfArrayBufferToImages(arrayBuffer, maxPages)
  } catch (error) {
    console.error('Error converting PDF from storage to images:', error)
    throw error
  }
}
