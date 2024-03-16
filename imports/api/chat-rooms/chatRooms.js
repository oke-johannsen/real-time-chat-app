import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const ChatRooms = new Mongo.Collection('chatRooms')

// Create a new chatRoom
const createChatRoom = async (chatRoom) => {
  return ChatRooms.insertAsync(chatRoom)
}

// Read all chatRooms
const getChatRooms = async (
  options = {
    filter: {},
    fields: {},
    limit: 0,
    skip: 0,
    sort: {},
  }
) => {
  return ChatRooms.find(...options).fetchAsync()
}

// Read a specific chatRoom by ID
const getChatRoomById = async (chatRoomId) => {
  return ChatRooms.findOneAsync({ _id: chatRoomId })
}

// Update a chatRoom by ID
const updateChatRoom = async (chatRoomId, updatedChatRoom) => {
  ChatRooms.updateAsync({ _id: chatRoomId }, { $set: updatedChatRoom })
}

// Delete a chatRoom by ID
const deleteChatRoom = async (chatRoomId) => {
  ChatRooms.removeAsync({ _id: chatRoomId })
}

if (Meteor.isServer) {
  Meteor.publish('chatRooms', function (filter = {}, fields = {}, sort = {}, limit = 0, skip = 0) {
    return ChatRooms.find(filter, fields, sort, limit, skip)
  })
  Meteor.methods({
    'chatRooms.create': createChatRoom,
    'chatRooms.get': getChatRooms,
    'chatRooms.getById': getChatRoomById,
    'chatRooms.update': updateChatRoom,
    'chatRooms.delete': deleteChatRoom,
  })
}
