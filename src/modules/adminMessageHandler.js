const { globalBuffer } = require('../globalBuffer')

module.exports.handleAdminResponse = async function (bot, adminMsg) {
  try {
    const adminId = adminMsg.chat.id

    if (!globalBuffer.msgQueue || Object.keys(globalBuffer.msgQueue).length === 0) {
      await bot.sendMessage(adminId, 'The message queue is empty.')
      return
    }

    const clientIds = Object.keys(globalBuffer.msgQueue).slice(0, 10)
    const buttons = clientIds.map(chatId => [
      {
        text: `Client ID: ${chatId} (${globalBuffer.msgQueue[chatId].length} msgs) - ${globalBuffer.msgQueue[chatId][0]?.content || 'No content'}`,
        callback_data: `select_client_${chatId}`
      }
    ])

    await bot.sendMessage(adminId, 'Select a client to respond to:', {
      reply_markup: {
        inline_keyboard: buttons
      }
    })
  } catch (error) {
    console.error('Error processing admin response:', error)
    await bot.sendMessage(adminMsg.chat.id, 'An error occurred while processing the response.')
  }
}

module.exports.respondToSelectedClient = async function (bot, adminMsg, targetChatId) {
  try {
    const adminId = adminMsg.chat.id

    if (!globalBuffer.msgQueue[targetChatId] || globalBuffer.msgQueue[targetChatId].length === 0) {
      await bot.sendMessage(adminId, 'The message queue for this client is empty.')
      return
    }

    const messageToRespond = globalBuffer.msgQueue[targetChatId].shift()
    if (messageToRespond.type === 'text') {
      await bot.sendMessage(targetChatId, `Admin response:\n${adminMsg.text}`)
    } else if (messageToRespond.type === 'photo') {
      await bot.sendPhoto(targetChatId, messageToRespond.fileId, { caption: `Admin response:\n${adminMsg.text}` })
    } else if (messageToRespond.type === 'document') {
      await bot.sendDocument(targetChatId, messageToRespond.fileId, { caption: `Admin response:\n${adminMsg.text}` })
    } else if (messageToRespond.type === 'audio') {
      await bot.sendAudio(targetChatId, messageToRespond.fileId, { caption: `Admin response:\n${adminMsg.text}` })
    } else if (messageToRespond.type === 'voice') {
      await bot.sendVoice(targetChatId, messageToRespond.filePath, { caption: `Admin response:\n${adminMsg.text}` })
    }

    if (globalBuffer.msgQueue[targetChatId].length === 0) {
      delete globalBuffer.msgQueue[targetChatId]
    }
    await bot.sendMessage(adminId, 'Response successfully sent to the client.')
  } catch (error) {
    console.error('Error processing admin response:', error)
    await bot.sendMessage(adminMsg.chat.id, 'An error occurred while sending the response.')
  }
}

