// var AllureReporter = require('jasmine-allure-reporter');
// var allureReporter = new AllureReporter({
//     allureReport: {
//         resultsDir: 'allure-results'
//     }
// });

var today = new Date(),
    timeStamp = today.getMonth() + 1 + '-' + today.getDate() + '-' + today.getFullYear() + '-' + today.getHours() + 'h-' + today.getMinutes() + 'm';

var log4js = require('log4js');

exports.config = {

    allScriptsTimeout: 30000,


    beforeLaunch:function(){

    },


    specs: [
        //'*.js'
       'grabResults.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        chromeOptions: {
            args:['--headless']
        },
        // shardTestFiles: true,
        // maxInstances: 2
    },

    params: {
    },

    framework: 'jasmine2',

    onPrepare: function () {

        browser.manage().window().setSize(1280, 1024);
        // browser.driver.manage().window().maximize();
        browser.logger = log4js.getLogger('console');
        browser.logger.setLevel('INFO'); // "INFO" , "WARN" , "ERROR" , "DEBUG" , "TRACE"
        browser.getCapabilities().then((c) => {
            console.log("platform: " + c.get('platform'));
            console.log("chrome driver version: " + c.get('chrome')['chromedriverVersion']);
            console.log("browserName: " + c.get('browserName'));
            console.log("browser version: " + c.get('version'));
        });

    },

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: true,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 400000000 // 108,7 hours seems should be enough
    },

    afterEach: function(){
        browser.restart();
    }

};