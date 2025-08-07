// Image upload utility to convert files to base64 data URLs

export const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file selected')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      reject('Please select an image file')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject('Error reading file')
    reader.readAsDataURL(file)
  })
}