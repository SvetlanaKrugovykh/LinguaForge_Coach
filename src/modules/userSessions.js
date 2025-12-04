
const { initializeUserSettings } = require('../services/userInitializeService')
const { selectedByUser } = require('../globalBuffer')
const fs = require('fs')
const path = require('path')

const catalogPath = process.env.USERS_DATA_CATALOG
const chatIdsFile = path.join(catalogPath, 'user_active_ids.json')

let chatIds = []

function addChatIdIfNotExists(chatId) {
  if (!chatIds.includes(chatId)) {
    chatIds.push(chatId)
    saveChatIdsToFile()
  }
}

function saveChatIdsToFile() {
  fs.writeFileSync(chatIdsFile, JSON.stringify(chatIds, null, 2), 'utf8')
}

function loadChatIdsFromFile() {
  if (fs.existsSync(chatIdsFile)) {
    try {
      const data = fs.readFileSync(chatIdsFile, 'utf8')
      chatIds = JSON.parse(data)
    } catch (e) {
      chatIds = []
    }
  } else {
    chatIds = []
  }
  return chatIds
}

async function restoreSessionsOnStartup(chatIdsToRestore) {
  for (const chatId of chatIdsToRestore) {
    if (!selectedByUser[chatId]) {
      selectedByUser[chatId] = await initializeUserSettings(chatId)
    }
  }
}

module.exports = {
  addChatIdIfNotExists,
  saveChatIdsToFile,
  loadChatIdsFromFile,
  restoreSessionsOnStartup,
  chatIds
}
