const express = require('express')
const exphbs = require('express-handlebars')
const { exec } = require("child_process")
const bodyParser = require('body-parser')
const NodeCache = require( "node-cache" )
const open = require('open')
const myCache = new NodeCache()


const CACHE_DURATION = 600*100
const CACHE_KEY = 'CACHE_KEY'


const app = express()

const PORT = 8000
 
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/:username', async (req, res) => {
    exec("sfdx force:org:open -u"+req.params.username,(error, stdout, stderr) => {
        if(stdout){
            res.redirect('/')
        }
    })
});

app.get('/', (req, res) => {
    res.render('home', {
        result: myCache.get(CACHE_KEY)
    })
});

exec("sfdx force:org:list --json", (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`)
        return
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`)
        return
    }
    myCache.set( CACHE_KEY, JSON.parse(stdout), CACHE_DURATION )
    
    app.listen(PORT,  () => {
        console.log(`App listening on port ${PORT}`)
        open('http://127.0.0.1:'+PORT)
    })
})

