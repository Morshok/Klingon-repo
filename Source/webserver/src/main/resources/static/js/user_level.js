const localForageCid = {
    objectName: 'ga_client_id',
    expires: 1000*60*60*24*365*2
};

function setClientId()
{
    //converted for direct code implementation from Simo Ahava´s solution for GTM; see 
    //https://www.simoahava.com/analytics/use-localstorage-client-id-persistence-google-analytics/
    //for details, and https://gist.github.com/mbaersch/677cfad72592631eea4d385116c91a63 for source.
    
    var GA_TRACKING_ID = 'UA-209720808-1';
    
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    if (window.localforage) {
    var lsCid;
    var jsonObj = window.localforage.getItem(localForageCid.objectName) || '{}';
    var obj = jsonObj;
    if(typeof obj === 'string')
    {
        obj = JSON.parse(obj);
    }
    var now = new Date().getTime();
    if (obj.clientId && obj.expires) {
        if (now <= obj.expires) {
            lsCid = obj.clientId;
        }
    }

    ga('create', GA_TRACKING_ID, { 'clientId': lsCid });
    ga(function(tracker) {
    var _lsc_clientId = tracker.get('clientId');
    var _lsc_obj = JSON.stringify({
        clientId: _lsc_clientId,
        expires: new Date().getTime() + localForageCid.expires
    });
    window.localforage.setItem(localForageCid.objectName, _lsc_obj);        
    });
    }
    else {
        ga('create', GA_TRACKING_ID, 'auto');
    }

    //Comment out if no anonymization required   
    //ga('set', 'anonymizeIp', true);
    //add additional configuration here. Example
    //ga('set', 'dimension1', 'foo');  
    ga('send', 'set', 'dimension1', 'pageview'); 
    
    insertUser();
}

function insertUser()
{
    window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        window.localforage.getItem('users').then(function(value) {
            var userData = value;
            var userAlreadyExists = false;
            
            if(userData != null)
            {
                for(var i = 0; i < value.length; i++)
                {
                    if(clientId == value[i].Id)
                    {
                        userAlreadyExists = true;
                        break;
                    }
                }   
            }
            
            if(!userAlreadyExists)
            {
                var dataToInput;
                if(userData == null)
                {
                    dataToInput = [{ Id: `${clientId}`, level: 0, experience: 0 }];   
                    userData = dataToInput;
                    window.localforage.setItem('users', userData);
                }
                else
                {
                    dataToInput = { Id: `${clientId}`, level: 0, experience: 0 };
                    userData.push(dataToInput);
                    window.localforage.setItem('users', userData);
                }   
                
                window.localforage.setItem('users', userData).then(function(result) {
                    console.log(result);
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function printUser()
{
    window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        window.localforage.getItem('users').then(function(value) {
            var userData = value;
            console.log(userData);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

//This is the same level curve
//as in Minecraft, which seemed
//rather smooth, values may need
//to be tinkered with though
function requiredExperience()
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
    
    window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        window.localforage.getItem('users').then(function(value) {
            var userData = value;
            
            var index;
            for(var i = 0; i < value.length; i++)
            {
                if(clientId == value[i].Id)
                {
                    index = i;
                    break;
                }
            }
            
            var userLevel = value[index].level;
            var userExperience = value[index].experience;
            
            var requiredExperienceToLevelUp = totalExperience(userLevel + 1);
            userExperience = userExperience + routeExperience;
            
            if(userExperience >= requiredExperienceToLevelUp)
            {
                var levelAfterExperienceIncrease = totalLevels(userExperience);
                var newExperienceProgress = totalExperience(levelAfterExperienceIncrease + 1) - totalExperience(levelAfterExperienceIncrease);
                
                setUserLevel(levelAfterExperienceIncrease);
                setUserExperience(newExperienceProgress);
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function getUserLevel()
{
    return window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        var fetchedUserLevel = window.localforage.getItem('users').then(function(value) {
            var userData = value;
            
            var index;
            for(var i = 0; i < value.length; i++)
            {
                if(clientId == value[i].Id)
                {
                    index = i;
                    break;
                }
            }
            
            var userLevel = value[index].level;
            return userLevel;
        }).catch(err => console.log(err));
        
        return fetchedUserLevel;
    }).then(function(result) {
        return result;
    }).catch(err => console.log(err));
}

function getUserExperience()
{
    return window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        var fetchedUserExperience = window.localforage.getItem('users').then(function(value) {
            var userData = value;
            
            var index;
            for(var i = 0; i < value.length; i++)
            {
                if(clientId == value[i].Id)
                {
                    index = i;
                    break;
                }
            }
            
            var userExperience = value[index].experience;
            return userExperience;
        }).catch(err => console.log(err));
        
        return fetchedUserExperience;
    }).then(function(result) {
        return result;
    }).catch(err => console.log(err));
}

function setUserLevel(level)
{
    window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        window.localforage.getItem('users').then(function(value) {
            var userData = value;
            
            var index;
            for(var i = 0; i < value.length; i++)
            {
                if(clientId == value[i].Id)
                {
                    index = i;
                }
            }
                    
            userData[index].level = level;
            
            window.localforage.setItem('users', userData).then(function(result) {
                console.log(result);
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function setUserExperience(experience)
{
    window.localforage.getItem(localForageCid.objectName).then(function(value) {
        var obj = JSON.parse(value);
        var clientId = obj.clientId;
        
        window.localforage.getItem('users').then(function(value) {
            var userData = value;
            
            var index;
            for(var i = 0; i < value.length; i++)
            {
                if(clientId == value[i].Id)
                {
                    index = i;
                }
            }
                    
            userData[index].experience = experience;
            
            window.localforage.setItem('users', userData).then(function(result) {
                console.log(result);
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

setClientId();