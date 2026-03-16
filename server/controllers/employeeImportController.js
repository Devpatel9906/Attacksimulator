const Employee = require('../models/Employee')
const csv = require('csv-parser')
const fs = require('fs')

async function importEmployees(request, reply) {

 const file = await request.file()

 const employees = []

 return new Promise((resolve, reject) => {

  fs.createReadStream(file.filepath)
   .pipe(csv())
   .on('data', row => {

    employees.push({
     displayName: row.name,
     email: row.email,
     phone: row.phone,
     department: row.department,
     telegramId: row.telegram,
     slackWebhook: row.slack,
     discordWebhook: row.discord,
     isActive: true
    })

   })
   .on('end', async () => {

    await Employee.insertMany(employees)

    reply.send({
     imported: employees.length
    })

   })

 })

}

module.exports = { importEmployees }