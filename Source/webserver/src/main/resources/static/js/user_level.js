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