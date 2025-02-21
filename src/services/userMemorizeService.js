const axios = require('axios')
const { selectedByUser } = require('../globalBuffer')

module.exports.setMemorize = async function (lang, msg, part, success) {
  try {
    const currentTest = selectedByUser[msg.chat.id]?.currentTest

    if (!currentTest || !Object.entries(currentTest).length) {
      return null
    }

    const response = await axios.post(`${process.env.SERVER_URL}/user-data-memorize`, {
      query: { "userId": msg.chat.id, "part": part, "lang": lang, currentTest, success }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    return response.data
  } catch (error) {
    console.error(error)
  }
}