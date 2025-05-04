const axios = require('axios')
require('dotenv').config()

module.exports.checkUserPermissions = async function (bot, msg) {

  try {
    let data = ''
    const response = await axios.post(`${process.env.SERVER_URL}/get-user-permissions`, {
      'user_id': msg.chat.id,
      'first_name': msg.chat.first_name,
      'last_name': msg.chat.last_name,
      'username': msg.chat.username,
      'language_code': 'pl',
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    data = response.data
    console.log(`User permissions ${msg.chat.id}:`, data)
    return data
  }
  catch (error) {
    console.error('Error fetching user permissions:', error)
    return null
  }
}



