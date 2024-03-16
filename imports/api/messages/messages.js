import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Messages = new Mongo.Collection('messages')

// Create a new message
const createMessage = async (message) => {
  return Messages.insertAsync(message)
}

// Read all messages
const getMessages = async (
  options = {
    filter: {},
    fields: {},
    limit: 0,
    skip: 0,
    sort: {},
  }
) => {
  return Messages.find(...options).fetchAsync()
}

// Read a specific message by ID
const getMessageById = async (messageId) => {
  return Messages.findOneAsync({ _id: messageId })
}

// Update a message by ID
const updateMessage = async (messageId, updatedMessage) => {
  Messages.updateAsync({ _id: messageId }, { $set: updatedMessage })
}

// Delete a message by ID
const deleteMessage = async (messageId) => {
  Messages.removeAsync({ _id: messageId })
}

if (Meteor.isServer) {
  Meteor.publish('messages', function (filter = {}, fields = {}, sort = {}, limit = 0, skip = 0) {
    return Messages.find(filter, fields, sort, limit, skip)
  })
  Meteor.methods({
    'messages.create': createMessage,
    'messages.get': getMessages,
    'messages.getById': getMessageById,
    'messages.update': updateMessage,
    'messages.delete': deleteMessage,
  })
}
