import React, { useEffect, useState } from 'react'
import useMessage from './useMessage'
import { Meteor } from 'meteor/meteor'

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getUniqueId = () => {
  // Check if the identifier is already stored
  let uniqueId = localStorage.getItem('uniqueId')

  // If not, generate a new one and store it
  if (!uniqueId) {
    uniqueId = generateUniqueId()
    localStorage.setItem('uniqueId', uniqueId)
  }

  return uniqueId
}

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
  }
  return hash
}

const generateColorFromUniqueId = (uniqueId) => {
  const hash = simpleHash(uniqueId)
  const color = `#${((hash >>> 0) & 0xffffff).toString(16).padStart(6, '0')}`

  return color
}

const isMobile = () => {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth
}

const ChatBox = () => {
  const [messages, setMessages] = useState([])
  useMessage()
    .then((result) => {
      setMessages(result)
    })
    .catch((err) => {
      console.error(err)
      alert('Error getting messages')
    })

  useEffect(() => {
    const chatBox = document.getElementById('chat-box')
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const [mobile, setMobile] = useState(isMobile())
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      setMobile(isMobile())
    }, 250)
  })

  return (
    <div
      style={{
        flex: '1 1 auto',
        padding: '0 0 1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        id='chat-box'
        style={{
          border: '1px solid black',
          flex: '1 1 auto',
          height: 'calc(100vh - 118px)',
          width: mobile ? '80vw' : '600px',
          overflow: 'auto',
          padding: '1rem',
        }}
      >
        {messages.map((message) => {
          const date = new Date(message?.timestamp)
          return (
            <div
              key={message._id}
              style={{
                display: 'flex',
                flexDirection: mobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: mobile ? 'start' : 'center',
                marginBottom: '1rem',
                flexWrap: 'nowrap',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  fontWeight: getUniqueId() !== message.uniqueId ? 'bolder' : 'normal',
                  color: generateColorFromUniqueId(message.uniqueId),
                }}
              >
                {message.uniqueId}:<br />
                {message.timestamp && (
                  <span>
                    [{date.toLocaleTimeString()} {date.toLocaleDateString()}]
                  </span>
                )}
              </span>
              <span style={{ flex: '1 1 auto' }}>{message.message}</span>
            </div>
          )
        })}
      </div>
      <ChatInput />
    </div>
  )
}

const ChatInput = () => {
  const [message, setMessage] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    const message = event.target[0].value
    Meteor.callAsync('messages.create', { message, uniqueId: getUniqueId(), timestamp: Date.now() })
      .then(() => {
        setMessage('')
      })
      .catch((err) => {
        console.error(err)
        alert('Error sending message')
      })
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}
    >
      <form
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'nowrap',
        }}
        onSubmit={handleSubmit}
      >
        <input
          type='text'
          value={message}
          placeholder='Enter message'
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: '1 1 auto' }}
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export const App = () => {
  useEffect(() => {
    const uniqueId = getUniqueId()
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexWrap: 'nowrap',
      }}
    >
      <h1>real-time-chat-app</h1>
      <ChatBox />
    </div>
  )
}
