const {ALLOWED_TRANSITIONS} = require('./ContractStateMachine');

module.exports = function validateStateTransition(currentState, newState, userRole) {
    const rule = ALLOWED_TRANSITIONS[currentState];
    if(!rule)
        return false;
    const isValidTransition = rule.next.includes(newState);
    const isRoleAllowed = rule.roles.includes(userRole);
    return isValidTransition && isRoleAllowed;
};