import React, { useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File, type: 'image' | 'video' | 'document') => void
  accept: string
  fileType: 'image' | 'video' | 'document'
  children: React.ReactNode
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept, 
  fileType, 
  children 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, fileType)
    }
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </>
  )
}

export default FileUpload
