import React from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  isOpen: boolean
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose, isOpen }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '👍', '👎', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖',
    '🙏', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✊', '✌️', '🤝', '👏', '🙌', '👐', '🤲', '🤜', '🤛', '🔥',
    '⭐', '🌟', '💫', '✨', '☄️', '💥', '💢', '💨', '🕳️', '💬',
    '🗨️', '💭', '🗯️', '💤', '👁️', '🗣️', '👤', '👥', '👶', '👧'
  ]

  if (!isOpen) return null
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-dark-card border border-dark-border rounded-lg shadow-lg p-3 sm:p-4 w-72 sm:w-80 max-h-60 sm:max-h-64 overflow-y-auto scrollbar-thin z-50">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base text-light font-medium">Seleccionar emoji</h3>
        <button
          onClick={onClose}
          className="text-light-gray hover:text-light transition-colors text-lg sm:text-xl"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji)
              onClose()
            }}
            className="text-xl sm:text-2xl hover:bg-dark-light rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmojiPicker
