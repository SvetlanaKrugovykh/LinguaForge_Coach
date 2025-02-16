const axios = require('axios')
const fs = require('fs')

module.exports.get1Test = async function (part1_3, lang, msg, bot) {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/get-test`, {
      query: { "userId": msg.chat.id, "part1_3": part1_3, "lang": lang, "isReturnFile": false }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    if (part_1_3 === '1') {
      let filename = response.data.filename
      const fileStream = fs.createReadStream(filename)
      await bot.sendVoice(msg.chat.id, fileStream)
    }

    return response.data
  } catch (error) {
    console.error(error)
  }
}