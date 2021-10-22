function insertUser()
{
    return window.localforage.getItem('user').then(function(value) {
        var userData = value;
        var userAlreadyExists = false;
            
        if(userData != null) { userAlreadyExists = true; }
            
        if(!userAlreadyExists)
        {
            userData = [{ level: 0, experience: 0 }]; 
            window.localforage.setItem('user', userData).then(function(result) {
                console.log(result);
            }).catch(err => console.log(err));
        }
        
        printUser();
    }).catch(err => console.log(err));
}

function printUser()
{
    window.localforage.getItem('user').then(function(result) {
        console.log(result);
    }).catch(err => console.log(err));
}

//This is the same level curve
//as in Minecraft, which seemed
//rather smooth, values may need
//to be tinkered with though
function requiredExperienceToNextLevel(level)
{
    if(level <= 15)
    {
        return 2 * level + 7;
    }
    else if(level >= 15 && level <= 30)
    {
        return 5 * level - 38;
    }
    else
    {
        return 9 * level - 158;
    }
}

function totalExperience(level)
{
    if(level < 0 && level === undefined)
    {
        console.log("Input either undefined or negative, setting to 0");
        level = 0;
    }
    
    var total = 0;
    
    if(level <= 16)
    {
        total = total + (Math.pow(level, 2) + 6 * level);
    }
    if(level >= 17 && level <= 31)
    {
        total = total + (2.5 * Math.pow(level, 2) - 40.5 * level + 360);
    }
    if(level >= 32)
    {
        total = total + (4.5 * Math.pow(level, 2) - 162.5 * level + 2220);
    }
    
    total = Math.round(total);
    return total;
}

function totalLevels(experience)
{
    if(experience < 0 && experience === undefined)
    {
        console.log("Input either undefined or negative, setting to 0");
        experience = 0;
    }
    
    var total = 0;
    
    if(experience <= 352)
    {
        total = total + (Math.sqrt(experience + 9) - 3);
    }
    if(experience >= 353 && experience <= 1507)
    {
        total = total + (8.1 + Math.sqrt(0.4 * (experience - 195.975)));
    }
    if(experience >= 1508) 
    {
        total = total + (18.056 + Math.sqrt(0.222 * (experience - 752.986)));
    }
    
    total = Math.floor(total);
    return total;
}
                      
function onLevelUp(level, experience) {
    setUserLevel(level);
    setUserExperience(experience);
}

function onFinishedRoute(routeExperience) {
    if(routeExperience === undefined)
    {
        routeExperience = 0; 
    }
    
    window.localforage.getItem('user').then(function(value) {
        var userData = value[0];
            
        var userLevel = userData.level;
        var userExperience = userData.experience;

        var xpInLevel = userExperience - totalLevels(userLevel);

        var xpInLevelWithRoute = xpInLevel + routeExperience;

        while(xpInLevelWithRoute >= totalExperience(userLevel + 1)){
            userLevel += 1
        }

        userExperience = xpInLevelWithRoute;

        setUserLevel(totalLevels(userExperience)).then(function(){
            setUserExperience(userExperience).then(function(){
                window.updateUserData();
            });
        });
    }).catch(err => console.log(err));
}

function getUserLevel()
{
    return window.localforage.getItem('user').then(function(value) {
        var userData = value;
            
        var userLevel = userData[0].level;
        return userLevel;
    }).catch(err => console.log(err));
}

function getUserExperience()
{
    return window.localforage.getItem('user').then(function(value) {
        var userData = value;
            
        var userExperience = userData[0].experience;
        return userExperience;
    }).catch(err => console.log(err));
}

function setUserLevel(level)
{
    return window.localforage.getItem('user').then(function(value) {
        var userData = value;
        userData[0].level = level;
            
        window.localforage.setItem('user', userData).then(function(result) {
            console.log(result);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function setUserExperience(experience)
{
    return window.localforage.getItem('user').then(function(value) {
        var userData = value;
        userData[0].experience = experience;
            
        window.localforage.setItem('user', userData).then(function(result) {
            console.log(result);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}