let EC = protractor.ExpectedConditions;
let until = protractor.ExpectedConditions;

const globalDefaultTimeout = 5000; // timeout by default

let waitElementToBeNotDisplayed = function (elem,/*optional*/timeoutAllowed) {
    let maxTimeoutAllowed;

    if (timeoutAllowed !== undefined && Number.isNaN(timeoutAllowed) !== true) {
        // browser.logger.info("Got the helper.waitElementToBeNotDisplayed(): timeoutAllowed=" + timeoutAllowed); // in future put in the DEBUG Log ?

        maxTimeoutAllowed = timeoutAllowed;
    }
    else {
        maxTimeoutAllowed = globalDefaultTimeout;
    }

    let timeOutForSleeping; // milliseconds to wait per every cycle

    if (maxTimeoutAllowed > globalDefaultTimeout) {
        timeOutForSleeping = 5000; // 5 seconds to wait per every cycle
    }
    else {
        timeOutForSleeping = 1000; // 1 second to wait per every cycle
    }

    let condition = false; // just for checking
    let timeOutForPrint = maxTimeoutAllowed;

    delay();

    let ifDisplayed = function (conditionToCheck) {
        elem.isDisplayed().then(function (isDisplayed) {

            // browser.logger.info("helper.waitElementToBeInVisible(): isDisplayed=" + isDisplayed);

            if (isDisplayed !== conditionToCheck) { // false != true

                browser.sleep(timeOutForSleeping);

                maxTimeoutAllowed = maxTimeoutAllowed - timeOutForSleeping;

                // browser.logger.info("helper.waitElementToBeInVisible(): maxTimeoutAllowed=" + maxTimeoutAllowed); // in future put in the DEBUG Log ?

                if (maxTimeoutAllowed > 0) {
                    ifDisplayed(conditionToCheck);
                }
                else {
                    browser.logger.warn("helper.waitElementToBeNotDisplayed(): The element is too long to be not displayed! Tried:" + timeOutForPrint);
                }
            }
        });
    };

    ifDisplayed(condition);
};

let waitElementToBeDisplayed = function (elem,/*optional*/timeoutAllowed) {
    let maxTimeoutAllowed;

    if (timeoutAllowed !== undefined && Number.isNaN(timeoutAllowed) !== true) {
        // browser.logger.info("Got the helper.waitElementToBeNotDisplayed(): timeoutAllowed=" + timeoutAllowed); // in future put in the DEBUG Log ?

        maxTimeoutAllowed = timeoutAllowed;
    }
    else {
        maxTimeoutAllowed = globalDefaultTimeout;
    }

    let timeOutForSleeping; // milliseconds to wait per every cycle

    if (maxTimeoutAllowed > globalDefaultTimeout) {
        timeOutForSleeping = 5000; // 5 seconds to wait per every cycle
    }
    else {
        timeOutForSleeping = 1000; // 1 second to wait per every cycle
    }

    let condition = true; // just for checking
    let timeOutForPrint = maxTimeoutAllowed;

    delay();

    let ifDisplayed = function (conditionToCheck) {
        elem.isDisplayed().then(function (isDisplayed) {

            // browser.logger.info("helper.waitElementToBeInVisible(): isDisplayed=" + isDisplayed);

            if (isDisplayed !== conditionToCheck) { // true != false

                browser.sleep(timeOutForSleeping);

                maxTimeoutAllowed = maxTimeoutAllowed - timeOutForSleeping;

                // browser.logger.info("helper.waitElementToBeInVisible(): maxTimeoutAllowed=" + maxTimeoutAllowed); // in future put in the DEBUG Log ?

                if (maxTimeoutAllowed > 0) {
                    ifDisplayed(conditionToCheck);
                }
                else {
                    browser.logger.warn("helper.waitElementToBeDisplayed(): The element is too long to be not displayed! Tried:" + timeOutForPrint);
                }
            }
        });
    };

    ifDisplayed(condition);
};


/** author agultsov
 *  Custom method for wait until the element is appeared in the DOM.
 *  It polls the page every 1 second by default until the maxTimeoutAllowed exceed.
 */
const waitElementToAppearInDOM = function (element, /*optional*/ timeoutAllowed) {
    let maxTimeoutAllowed;

    if(timeoutAllowed !== undefined && Number.isNaN(timeoutAllowed) !== true) {
        // browser.logger.info("Got the helper.waitElementToAppearInDOM(): timeoutAllowed=" + timeoutAllowed); // in future put in the DEBUG Log ?

        maxTimeoutAllowed = timeoutAllowed;
    }
    else {
        maxTimeoutAllowed = globalDefaultTimeout;
    }

    let timeOutForSleeping; // milliseconds to wait per every cycle

    if(maxTimeoutAllowed > globalDefaultTimeout) {
        timeOutForSleeping = 5000; // 5 seconds to wait per every cycle
    }
    else {
        timeOutForSleeping = 1000; // 1 second to wait per every cycle
    }

    let condition = true; // just for checking
    let timeOutForPrint = maxTimeoutAllowed;

    let ifPresent = function (conditionToCheck) {
        element.isPresent().then(function (isPresent) {

            // browser.logger.info("helper.waitElementToAppearInDOM(): isPresent=" + isPresent);

            if(isPresent !== conditionToCheck) { // false != true

                browser.sleep(timeOutForSleeping);

                maxTimeoutAllowed = maxTimeoutAllowed - timeOutForSleeping;

                // browser.logger.info("helper.waitElementToAppearInDOM(): maxTimeoutAllowed=" + maxTimeoutAllowed); // in future put in the DEBUG Log ?

                if(maxTimeoutAllowed > 0) {
                    ifPresent(conditionToCheck);
                }
                else {
                    browser.logger.warn("helper.waitElementToAppearInDOM(): The element is too long loading! Tried:" + timeOutForPrint);
                }
            }
        });
    };

    ifPresent(condition);
};


let mouseMoveTo = function (webElement) {

    waitElementToAppearInDOM(webElement);

    return browser.actions().mouseMove(webElement).perform();
};

/**  @author ytarankov
 * for getting Html content from the document body */
let getHtml_from_documentBody = function () {
    let getHtmlcontent = function () {
        return browser.executeScript('return $("body").html()');
    };
    getHtmlcontent().then(function(result) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                console.log("*** Trying to get Html content from the document body...***");
                return resolve(result);
            }, 3000)
        })
    })
        .then(function(result) {
            console.log(result);
        });
};

let ifElementHasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

let ifElementHasAttribute = function (element, attr) {
    return element.getAttribute(attr).then(function (attributes) {
        return attributes.indexOf(attr) !== -1;
    });
};

let getElementByRepeaterAndPrintFound = function (repeaterValue) {
    return element.all(by.repeater(repeaterValue)).each(function (elem) {
        elem.getText().then(function (text) {
            console.log(text);
        });
    });
};

let delay = function (millis) {
    let delayTime;
    if(millis !== undefined && Number.isNaN(millis) !== true) {
        delayTime = millis;
    }
    else {
        delayTime = 10;
    }

    browser.ignoreSynchronization = true;
    browser.sleep(delayTime);
};

exports.waitElementToBeNotDisplayed = waitElementToBeNotDisplayed;
exports.waitElementToBeDisplayed = waitElementToBeDisplayed;
exports.waitElementToAppearInDOM = waitElementToAppearInDOM;
exports.getHtml_from_documentBody = getHtml_from_documentBody;
exports.ifElementHasClass = ifElementHasClass;
exports.ifElementHasAttribute = ifElementHasAttribute;
exports.getElementByRepeaterAndPrintFound = getElementByRepeaterAndPrintFound;
exports.mouseMoveTo = mouseMoveTo;
exports.delay = delay;
