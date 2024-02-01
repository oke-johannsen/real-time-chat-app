import { useTracker } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import { Messages } from '../api/messages/messages'

const useMessage = () => {
  const messages = useTracker(async () => {
    Meteor.subscribe('messages')
    const newMessages = await Messages.find().fetchAsync()
    return newMessages
  }, [])
  return messages
}

export default useMessage
