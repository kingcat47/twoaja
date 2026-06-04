const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const MAX_PX = 1920
      if (width > MAX_PX || height > MAX_PX) {
        const ratio = Math.min(MAX_PX / width, MAX_PX / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.8
      )
    }
    img.src = url
  })
}

export async function uploadImage(file: File): Promise<string> {
  console.log('[Cloudinary] 원본 파일:', file.name, file.size, 'bytes')
  const target = file.size > MAX_SIZE ? await compressImage(file) : file
  console.log('[Cloudinary] 업로드 파일:', target.name, target.size, 'bytes')

  const formData = new FormData()
  formData.append('file', target)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload?upload_preset=${UPLOAD_PRESET}`,
    { method: 'POST', body: formData }
  )

  console.log('[Cloudinary] 응답 status:', res.status)
  const data = await res.json()
  console.log('[Cloudinary] 응답 body:', data)

  if (!res.ok) throw new Error('이미지 업로드 실패')

  console.log('[Cloudinary] 업로드 성공:', data.secure_url)
  return data.secure_url as string
}
