const axios = require('axios')
const { selectedByUser } = require('../globalBuffer')

module.exports.setMemorize = async function (part1_3, lang, msg, bot) {

  try {
    const response = await axios.post(`${process.env.SERVER_URL}/user-data-memorize`, {
      query: { "userId": msg.chat.id, "part1_3": part1_3, "lang": lang }
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