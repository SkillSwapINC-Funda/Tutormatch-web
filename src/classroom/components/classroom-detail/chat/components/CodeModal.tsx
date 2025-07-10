import React, { useState } from 'react'
import { X, Code, Eye } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSendCode: (code: string, language: string) => void
}

const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, onSendCode }) => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [showPreview, setShowPreview] = useState(false)

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'markup', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' }
  ]

  // Mapeo de lenguajes para syntax highlighter
  const getSyntaxLanguage = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'php': 'php',
      'markup': 'markup',
      'css': 'css',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'bash': 'bash',
      'powershell': 'powershell',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'kotlin': 'kotlin',
      'swift': 'swift'
    }
    return languageMap[lang] || 'text'
  }

  const handleSend = () => {
    if (code.trim()) {
      onSendCode(code.trim(), language)
      setCode('')
      setShowPreview(false)
      onClose()
    }
  }

  const handleClear = () => {
    setCode('')
    setShowPreview(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
    // Tab key para indentación
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newValue)
      // Restaurar la posición del cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-dark-card border border-dark-border rounded-lg shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-light">Insertar Código</h2>
          </div>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-light transition-colors p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Language Selector y Toggle Preview */}
        <div className="p-3 sm:p-4 border-b border-dark-border flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-light mb-2">
                Lenguaje de programación:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-dark-light border border-dark-border rounded-lg px-3 py-2 text-sm sm:text-base text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex bg-dark-light rounded-lg p-1 border border-dark-border">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1.5 rounded text-sm transition-all duration-200 flex items-center gap-1.5 ${!showPreview
                      ? 'bg-primary text-light shadow-sm'
                      : 'text-light-gray hover:text-light hover:bg-dark-border/50'
                    }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1.5 rounded text-sm transition-all duration-200 flex items-center gap-1.5 ${showPreview
                      ? 'bg-primary text-light shadow-sm'
                      : 'text-light-gray hover:text-light hover:bg-dark-border/50'
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista previa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Input/Preview */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full p-3 sm:p-4">
            {!showPreview ? (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu código aquí..."
                className="w-full h-full min-h-[250px] sm:min-h-[350px] bg-dark-light border border-dark-border rounded-lg p-3 text-light font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors scrollbar-thin"
                spellCheck={false}
                style={{
                  tabSize: 2,
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
              />
            ) : (
              <div className="h-full min-h-[250px] sm:min-h-[350px] bg-dark-light border border-dark-border rounded-lg overflow-hidden">
                {code.trim() ? (
                  <div className="h-full overflow-auto scrollbar-thin">
                    <SyntaxHighlighter
                      language={getSyntaxLanguage(language)}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '16px',
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                        minHeight: '100%',
                        borderRadius: '0'
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      showLineNumbers={true}
                      lineNumberStyle={{
                        color: '#6b7280',
                        paddingRight: '1em',
                        fontSize: '12px',
                        minWidth: '2.5em',
                        textAlign: 'right',
                        userSelect: 'none'
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          lineHeight: 'inherit'
                        }
                      }}
                      PreTag={({ children, ...props }) => (
                        <pre
                          {...props}
                          style={{
                            ...props.style,
                            margin: 0,
                            padding: '16px',
                            background: 'transparent',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            maxWidth: '100%'
                          }}
                        >
                          {children}
                        </pre>
                      )}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-light-gray">
                    <div className="text-center">
                      <Code className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Escribe código para ver la vista previa</p>
                      <p className="text-xs mt-1 opacity-75">Con resaltado de sintaxis para {languages.find(l => l.value === language)?.label}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-t border-dark-border gap-3 sm:gap-0 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-light-gray">
              <kbd className="px-1.5 py-0.5 text-xs bg-dark-border rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-dark-border rounded">Enter</kbd> para enviar
            </p>
            <p className="text-xs text-light-gray">
              <kbd className="px-1.5 py-0.5 text-xs bg-dark-border rounded">Tab</kbd> para indentar
            </p>
            {showPreview && (
              <p className="text-xs text-light-gray">
                Cambia a "Editar" para modificar el código
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleClear}
              disabled={!code.trim()}
              className="flex-none px-3 py-2 text-light-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-light-gray hover:text-light transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!code.trim()}
              className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-light-gray disabled:hover:bg-light-gray text-light rounded-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              Enviar Código
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeModal