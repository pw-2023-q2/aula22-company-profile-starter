import e from 'express'
import path from 'path'
import { engine } from "express-handlebars"
import {multipartyExpress as multiparty, cleanup} from "multiparty-express"
import bodyParser from "body-parser"

import {config} from "../conf/config"
import * as dbConnect from "./models/db-connection"
import * as profileController from "./controllers/profile-controller"

const app = e()

/**
 * Configure templating engine
 */
app.engine("handlebars", engine({
    helpers: {
        userAge: (birthyear: number) => (new Date()).getFullYear() - birthyear,
        equals: (a: string, b: string) => a == b,
        isEmpty: (s: string) => !s || s.length == 0
    }
}))
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname, "..", "views"))

/**
 * Static routes
 */
app.use('/static', e.static(path.join(__dirname, '..', 'static')));
app.use('/lib/bootstrap', e.static(
    path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist')));
app.use('/lib/jquery', e.static(
    path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')));
app.use('/picture', e.static(config.upload_dir));


/**
 * Dynamic routes
 */
app.get("/", (req, res) => {
    res.redirect("/list")
})
app.get("/list", profileController.list)
app.get("/profile/:id", profileController.details)
app.get("/add", profileController.addForm)
app.post("/add", multiparty(), (req, res) => {
    profileController.addFormProcessing(req, res)
    cleanup(req)
})
app.get("/edit/:id", profileController.editForm)
app.post("/edit", multiparty(), (req, res) => {
    profileController.editFormProcessing(req, res)
    cleanup(req)
})
app.post("/remove", bodyParser.urlencoded({extended: true}), 
    profileController.removeFormProcessing)

/**
 * Makes sure the db is on before server is on
 */
console.log("Starting server stack...")
dbConnect.connect()
    .then(() => {
        app.listen(config["server-port"], () => {
            console.log(`Server listening at ${config["server-port"]}`)
        })
    })
    .catch(error => {
        console.error("Failed to load server stack")
        console.error(error.stack)
    })


process.on('exit', (code) => {
    console.log(`Server exiting with code ${code}`)
});
function exitHandler() {
    dbConnect.disconnect()
        .then(() => process.exit())
        .catch(error => {
            console.error("Failed to shutdown server stack")
            console.error(error.stack)
        })
}
process.once('SIGINT', exitHandler)
process.once('SIGUSR2', exitHandler)
