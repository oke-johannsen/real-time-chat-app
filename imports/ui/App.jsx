import React, { useEffect, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { generateColorFromUniqueId, getUniqueId, isMobile } from './lib'
import { Messages } from '../api/messages/messages'
import { ChatRooms } from '../api/chat-rooms/chatRooms'

const ChatRoomBox = ({ selectedChatRoom, setSelectedChatRoom, mobile }) => {
  const [chatRooms, setChatRooms] = useState([])
  useTracker(async () => {
    Meteor.subscribe('chatRooms')
    ChatRooms.find()
      .fetchAsync()
      .then((res) => {
        setChatRooms(res)
      })
  }, [])

  const handleClick = (e, cR) => {
    e.preventDefault()
    setSelectedChatRoom(cR)
  }

  return (
    <div
      style={{
        width: mobile ? '20vw' : '200px',
        padding: '1rem',
        height: 'calc(100vh - 81px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ margin: 0 }}>Chat rooms</h2>
      <div>
        <button
          title='Create chat room'
          style={{ margin: '0.5rem 0', width: '100%' }}
          onClick={() => {
            Meteor.callAsync('chatRooms.create', { name: prompt('Enter chat room name') })
              .then((res) => {
                alert('Chat room created')
                setSelectedChatRoom(res)
              })
              .catch((err) => {
                console.error(err)
                alert('Error creating chat room')
              })
          }}
        >
          +
        </button>
      </div>
      {chatRooms.map((cR) => {
        return (
          <div
            key={cR._id}
            style={{ margin: '0.5rem 0', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '0.5rem' }}
          >
            <button
              title='Select chat room'
              style={{ flex: '1 1 auto', fontWeight: selectedChatRoom?._id === cR._id ? 'bolder' : 'normal' }}
              onClick={(e) => handleClick(e, cR)}
            >
              {cR.name}
            </button>
            <button
              title='Delete chat room'
              onClick={() => {
                Meteor.callAsync('chatRooms.delete', cR._id)
                  .then(() => {
                    alert('Chat room deleted')
                  })
                  .catch((err) => {
                    console.error(err)
                    alert('Error deleting chat room')
                  })
              }}
            >
              x
            </button>
          </div>
        )
      })}
    </div>
  )
}

const MessageBox = ({ selectedChatRoom, mobile }) => {
  const [messages, setMessages] = useState([])
  useTracker(async () => {
    Meteor.subscribe('messages')
    Messages.find({ chatRoomId: selectedChatRoom?._id })
      .fetchAsync()
      .then((res) => {
        setMessages(res)
      })
  }, [selectedChatRoom])

  useEffect(() => {
    const chatBox = document.getElementById('chat-box')
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  return (
    <div
      id='chat-box'
      style={{
        border: '1px solid black',
        flex: '1 1 auto',
        height: 'calc(100vh - 81px)',
        width: mobile ? '60vw' : '600px',
        overflow: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
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
      {selectedChatRoom && <ChatInput selectedChatRoom={selectedChatRoom} />}
    </div>
  )
}

const ChatBox = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null)

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
        flexDirection: 'row',
        gap: '1rem',
      }}
    >
      <ChatRoomBox
        selectedChatRoom={selectedChatRoom}
        setSelectedChatRoom={setSelectedChatRoom}
        mobile={mobile}
      />
      <MessageBox
        selectedChatRoom={selectedChatRoom}
        mobile={mobile}
      />
    </div>
  )
}

const ChatInput = ({ selectedChatRoom }) => {
  const [message, setMessage] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    const message = event.target[0].value
    Meteor.callAsync('messages.create', {
      message,
      uniqueId: getUniqueId(),
      timestamp: Date.now(),
      chatRoomId: selectedChatRoom?._id,
    })
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
        <textarea
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
