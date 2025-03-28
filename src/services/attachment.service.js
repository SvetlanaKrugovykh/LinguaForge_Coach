
const fs = require('fs')
const path = require('path')
const util = require('util')
const pipeline = util.promisify(require('stream').pipeline)


module.exports.askForAttachment = async function (bot, msg, selectedByUser) {
  try {
    await bot.sendMessage(msg.chat.id, 'Будь ласка, відправте файл:')

    const attachmentMsg = await new Promise((resolve, reject) => {
      bot.once('document', resolve)
      bot.once('photo', resolve)
      bot.once('text', () => reject(new Error('Invalid input')))
    })

    const selectedByUser_ = await addOrderAttachment(bot, attachmentMsg, selectedByUser)
    if (selectedByUser_ === null) {
      return selectedByUser
    } else {
      return selectedByUser_
    }
  } catch (err) {
    console.error(err)
    return selectedByUser
  }
}


module.exports.askForPicture = async function (bot, msg, selectedByUser) {
  try {
    await bot.sendMessage(msg.chat.id, 'Будь ласка, вставте картинку:')
    console.log(`askForPicture started:`)

    const dirPath = process.env.DOWNLOAD_APP_PATH
    await checkDirPath(dirPath)

    const pictureMsg = await new Promise((resolve, reject) => {
      bot.once('photo', (photoMsg) => {
        if (photoMsg && photoMsg.photo) {
          resolve(photoMsg)
        } else {
          reject(new Error('No photo found in message'))
        }
      })
    })

    if (!pictureMsg.photo || pictureMsg.photo.length === 0) {
      console.log('No photo found in message')
      return null
    }

    const pictureFileId = pictureMsg.photo[pictureMsg.photo.length - 1].file_id
    const pictureFileName = `photo_${msg.chat.id.toString()}_${Date.now()}.jpg`
    const pictureFilePath = path.join(dirPath, pictureFileName).replace(/\/\//g, '/')

    const fileStream = await bot.getFileStream(pictureFileId)
    const file = fs.createWriteStream(pictureFilePath)

    fileStream.on('error', (err) => {
      console.error('Error receiving file stream:', err)
      file.close()
      fs.unlinkSync(pictureFilePath)
      return null
    })

    await new Promise((resolve, reject) => {
      fileStream.pipe(file)
      file.on('finish', resolve)
      file.on('error', (err) => {
        console.error('Error writing file:', err)
        fs.unlinkSync(pictureFilePath)
        reject(err)
        return null
      })
    })

    const fileNames = selectedByUser.OrderAttachmentFileNames || []
    const selectedByUser_ = { ...selectedByUser, OrderAttachmentFileNames: [...fileNames, pictureFileName] }
    console.log(`added OrderPicture: `, pictureFileName)
    return selectedByUser_
  } catch (err) {
    console.log(err)
    return null
  }
}

async function addOrderAttachment(bot, msg, selectedByUser) {
  try {
    const dirPath = process.env.DOWNLOAD_APP_PATH
    await checkDirPath(dirPath)
    console.log(`addOrderAttachment started: ${msg?.document?.file_name}`)

    let fileId, fileName
    if (msg && msg.document) {
      fileId = msg.document.file_id
      fileName = msg.document.file_name
      const fileExtension = path.extname(fileName) || '.unknown'
      fileName = `file_${msg.chat.id.toString()}_${Date.now()}${fileExtension}`
    } else if (msg && msg.photo) {
      fileId = msg.photo[msg.photo.length - 1].file_id
      fileName = `photo_${msg.chat.id.toString()}_${Date.now()}.jpg`
    } else {
      console.log('Invalid file attachment input')
      return null
    }

    const filePath = path.join(dirPath, fileName).replace(/\/\//g, '/')
    const fileStream = await bot.getFileStream(fileId)
    const file = fs.createWriteStream(filePath)

    await new Promise((resolve, reject) => {
      fileStream.pipe(file)
      file.on('finish', resolve)
      file.on('error', (err) => {
        console.error('Error writing file:', err)
        fs.unlinkSync(filePath)
        reject(err)
        return null
      })
    })

    const fileNames = selectedByUser.OrderAttachmentFileNames || []
    const newSelectedByUser = { ...selectedByUser, OrderAttachmentFileNames: [...fileNames, fileName] }
    console.log(`addOrderAttachment fileNames: +${fileName} `, fileNames)

    console.log(`added OrderAttachment: `, fileName)
    return newSelectedByUser
  } catch (err) {
    console.error('Error adding Order attachment:', err)
    return selectedByUser
  }
}

async function checkDirPath(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`Directory ${dirPath} created successfully`)
  }
}
