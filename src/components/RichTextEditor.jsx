import { useState, useRef, useEffect } from 'react'
import './RichTextEditor.css'

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isUpdating) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current && !isUpdating) {
      setIsUpdating(true)
      onChange(editorRef.current.innerHTML)
      setTimeout(() => setIsUpdating(false), 0)
    }
  }

  const handleColorChange = (color) => {
    execCommand('foreColor', color)
    setShowColorPicker(false)
  }

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => execCommand('bold')} title="Negrito">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="Itálico">
          <em>I</em>
        </button>
        <button type="button" onClick={() => execCommand('underline')} title="Sublinhado">
          <u>U</u>
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} title="Riscado">
          <s>S</s>
        </button>
        
        <div className="separator"></div>
        
        <button type="button" onClick={() => execCommand('justifyLeft')} title="Alinhar à esquerda">
          ⬅
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Centralizar">
          ↔
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Alinhar à direita">
          ➡
        </button>
        
        <div className="separator"></div>
        
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Lista">
          • Lista
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Lista numerada">
          1. Lista
        </button>
        
        <div className="separator"></div>
        
        <div className="color-picker-container">
          <button 
            type="button" 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            title="Cor do texto"
            className="color-btn"
          >
            🎨
          </button>
          {showColorPicker && (
            <div className="color-picker">
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'].map(color => (
                <button
                  key={color}
                  type="button"
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="separator"></div>
        
        <select onChange={(e) => execCommand('fontSize', e.target.value)} defaultValue="3">
          <option value="1">Muito pequeno</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Grande</option>
          <option value="5">Muito grande</option>
        </select>
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        style={{ minHeight: '200px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  )
}

export default RichTextEditor