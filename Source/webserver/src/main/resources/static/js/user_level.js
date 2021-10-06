function nextLevel(level) {
    var exponent = 1.5, baseExperience = 1000;
    
    return Math.floor(baseExperience * (Math.pow(level, exponent)));
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