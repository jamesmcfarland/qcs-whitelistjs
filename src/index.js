const { default: axios } = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const googleCredentials = require("../google-credentials.json");
require('dotenv').config()
const fs = require("fs");

const main = async () => {
    console.log("QCS MC Whitelist\nJames McFarland\nQueen's Computing Society\n\nConnecting to google...")
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID)
    await doc.useServiceAccountAuth(googleCredentials)
    await doc.loadInfo()
    const sheet = await doc.sheetsByTitle["minecraft"]
    console.log("Getting users")
    let usernames = await sheet.getRows();
    usernames = usernames.map(row => row["username"])
    usernames = usernames.filter(username => !!username && username !== "-" && username.toLowerCase() !== "n/a")

    console.log(usernames.length + " players to get");

    let allUsersToPost = []
    let usersToPost = []
    for (let i = 0; i < usernames.length; i++) {


        usersToPost.push(usernames[i])

        if (usersToPost.length % 10 === 0) {

            allUsersToPost.push(usersToPost)
            usersToPost = []
        }
        else if (i === usernames.length - 1) {

            allUsersToPost.push(usersToPost)
        }

    }

    let playersAndUUIDS = []

    console.log("Fetching UUIDs")

    for (let i = 0; i < allUsersToPost.length; i++) {
        console.log(`Fetching ${i + i}/${allUsersToPost.length}`)
        const resp = await axios.post("https://api.mojang.com/profiles/minecraft", allUsersToPost[i])
        for (const player of resp.data) {
            playersAndUUIDS.push({ uuid: player.id, name: player.name })
        }
    }
    console.log("Processed all users... saving to file")

    fs.writeFileSync(process.env.WHITELIST_PATH, JSON.stringify(playersAndUUIDS))
}

main()