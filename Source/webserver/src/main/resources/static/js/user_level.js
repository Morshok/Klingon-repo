function setClientId()
{
    //converted for direct code implementation from Simo Ahava´s solution for GTM; see 
    //https://www.simoahava.com/analytics/use-localstorage-client-id-persistence-google-analytics/
    //for details, and https://gist.github.com/mbaersch/677cfad72592631eea4d385116c91a63 for source.
    
    var GA_TRACKING_ID = 'UA-209720808-1';
    var localForageCid = {
        objectName: 'ga_client_id',
        expires: 1000*60*60*24*365*2
    };
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

function getClientId()
{
    window.localforage.getItem('ga_client_id', function(err, value) {
        if(err == null)
        {
            var obj = JSON.parse(value);
            return obj.clientId;      
        }
    });
}

function insertUser()
{
    var clientId = getClientId();
    var userData = [ { Id: clientId, level: 0, experience: 0 } ];
    window.localforage.setItem('users', userData);
    
    window.localforage.getItem('users', function(err, value) {
        if(err == null)
        {
            console.log(value);
        }
    });
}

setClientId();

//This is the same level curve
//as in Minecraft, which seemed
//rather smooth, values may need
//to be tinkered with though
function nextLevel(level) {
    if(level === undefined)
    {
        level = 1;    
    }
    
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
                      
function onLevelUp(level, experience) {
    setUserLevel(level);
    setUserExperience(experience);
}

function onFinishedRoute(routeExperience) {
    if(routeExperience === undefined)
    {
        routeExperience = 0; 
    }
    
    var userLevel = getUserLevel();
    var userExperience = getUserExperience() + routeExperience;
    var experienceToNextLevel = nextLevel(userLevel);
    
    if(userExperience >= experienceToNextLevel)
    {
        userLevel = userLevel + 1;
        userExperience = userExperience % experienceToNextLevel;
        
        onLevelUp(userLevel, userExperience);
    }
}

function getUserLevel() {
    
}

function getUserExperience() {
    
}

function setUserLevel(level) {
    
}

function setUserExperience(experience) {
    
}