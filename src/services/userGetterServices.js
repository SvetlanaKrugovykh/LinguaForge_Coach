const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()
const usersDataCatalog = process.env.USERS_DATA_CATALOG

module.exports.getFromUserFile = function (chatId) {
  const SERVER_URL = process.env.SERVER_URL;
  if (SERVER_URL) {
    try {
      const axios = require('axios');
      // Try to get user data from server
      return axios.get(`${SERVER_URL}/user-get`, { params: { user_id: chatId } })
        .then(res => {
          if (res.status === 200 && res.data) {
            return res.data;
          } else {
            throw new Error('No user data from server');
          }
        })
        .catch(() => {
          // Fallback to local file
          try {
            const filePath = path.join(usersDataCatalog, `${chatId}.json`);
            return JSON.parse(fs.readFileSync(filePath));
          } catch (error) {
            console.log(`${usersDataCatalog}/${chatId}.json not found`);
            return {};
          }
        });
    } catch (err) {
      // Fallback to local file
      try {
        const filePath = path.join(usersDataCatalog, `${chatId}.json`);
        return JSON.parse(fs.readFileSync(filePath));
      } catch (error) {
        console.log(`${usersDataCatalog}/${chatId}.json not found`);
        return {};
      }
    }
  } else {
    // No SERVER_URL, fallback to local file
    try {
      const filePath = path.join(usersDataCatalog, `${chatId}.json`);
      return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
      console.log(`${usersDataCatalog}/${chatId}.json not found`);
      return {};
    }
  }
}


module.exports.getNativeLanguage = function (chatId) {
  if (!selectedByUser[chatId]) selectedByUser[chatId] = module.exports.getFromUserFile(chatId)
  return selectedByUser[chatId]?.nativeLanguage || 'pl'
}

module.exports.getLanguage = function (chatId) {
  if (!selectedByUser[chatId]) selectedByUser[chatId] = module.exports.getFromUserFile(chatId)
  return selectedByUser[chatId]?.language || 'pl'
}
