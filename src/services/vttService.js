const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
require('dotenv').config()


module.exports.getVTT = async function (filePath) {
  try {
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))

    const formHeaders = form.getHeaders()

    const URL_VTT = process.env.URL_VTT
    const response = await axios.post(URL_VTT, form, {
      headers: {
        ...formHeaders
      }
    })
    fs.unlinkSync(filePath)
    return response.data?.replyData
  } catch (error) {
    console.error('Error:', error)
  }
}