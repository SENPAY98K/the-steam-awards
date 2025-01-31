const fs = require('fs');
var config = [];
try {
    config = require('../config');
} catch (error) {
    
}
const Settings = require('../lib/Settings');
//change Settings here.

var args = process.argv;
if(args.length > 2){
    var fileLink = args[2];
    try {
        if (fs.existsSync(fileLink)) {
            //file exists
            const data = fs.readFileSync(fileLink, {encoding:'utf8', flag:'r'});
            const loginRows = data.split("\n");
            for (let i = 0; i < loginRows.length; i++) {
                const login = loginRows[i];
                const loginInfo = login.split(":")
                if(loginInfo.length > 1){
                    var existingAuth = FindExistingConfig(Replace(loginInfo[0]));
                    if(existingAuth == null) // do not allready exist, then we add it
                    {
                        var auth = {}
                        auth[Settings.AuthFieldNameUsername] = Replace(loginInfo[0]);
                        auth[Settings.AuthFieldNamePassword] = Replace(loginInfo[1]);
                        if(loginInfo.length > 2){
                            auth[Settings.AuthFieldNamesharedSecret] = Replace(loginInfo[2]);
                            if(loginInfo.length > 3){
                                auth[Settings.AuthFieldSpecialAccountText] = Replace(loginInfo[3]);
                            }
                        }
                        config.push(auth);
                    }else{ //updated existing Account
                        if(existingAuth[Settings.AuthFieldNamePassword] != Replace(loginInfo[1])){
                            existingAuth[Settings.AuthFieldNamePassword] = Replace(loginInfo[1]);
                        }
                        if(loginInfo.length > 2){
                            if(existingAuth[Settings.AuthFieldNamesharedSecret] != Replace(loginInfo[2])){
                                existingAuth[Settings.AuthFieldNamesharedSecret] = Replace(loginInfo[2]);
                            }
                            if(loginInfo.length > 3){
                                existingAuth[Settings.AuthFieldSpecialAccountText] = Replace(loginInfo[3]);
                            }
                        }
                    }
                    //save file
                    var endString = `var config = ${ JSON.stringify(config, null, 4) };\n`;
                        endString += "module.exports = config;";
                    fs.writeFile('config.js', endString, err => {
                        if (err) {
                        console.error(err)
                        return
                        }
                        //file written successfully
                    })
                }else{
                    console.log("login do not have right format: "+ login );
                }
            }
        }else{
            console.error("File do not exist")
        }
    } catch(err) {
        console.error("File do not exist")
        console.error(err)
    }
} else {
    console.log("start whit 'npm run ConvertFromLineFormat [FilePath]' whit a full path to the file.")

}
function FindExistingConfig(pUserName) {
    for (let i = 0; i < config.length; i++) {
        const auth = config[i];
        if(auth[Settings.AuthFieldNameUsername] == pUserName){
            return auth;
        }
    }
    return null;
}
function Replace(text) {
    return text.replace(/[\r\n]/gm, '');
}