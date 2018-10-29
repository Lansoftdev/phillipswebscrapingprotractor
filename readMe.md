# `scrapephil` Based on Protractor project for grab Auction results from phillips site.

## Directory Layout

```
config    --> dir with configuration file 'defaultConfig.js'
specs     --> dir with program 'grabResults.js' and configuration file to launch 
helper.js --> utility file
```

There are below properties to modify in the 'defaultConfig.js':

YEAR: "2018" - year for get the results

MONTH: "Oct" - month for get the results, actually it is possibly to use token like "20 Apr",
		if program is able to find such category on the Web Page. 

SORT_BY: "Oldest" - sorting the Auctions on the Web Page

GRAB_MODE: "Standard" - Mode which is used for build the output file. This parameter affects only 4 columns:
		Lot date, Description, Dimensions, More details. 

		There are 4 modes for now is available. It is possible to use one of them:

		GRAB_MODE: "Standard" - regular Web page structure like in 2011 year, etc.
		GRAB_MODE: "Wrkrnd_1Dec2015" - workaround for Web page like 1 Dec 2015
		GRAB_MODE: "Wrkrnd_Dec2014" - workaround for Web page like 8 Dec 2014
		GRAB_MODE: "Wrkrnd_OnlyDescription" - workaround for Web page like 27 Nov 2017, 28 May 2018

BASE_URL: "https://www.phillips.com/auctions/past/filter/Year=" - URL to navigte, the programm uses it and props YEAR and SORT_BY.
		Finally url looks like 'https://www.phillips.com/auctions/past/filter/Year=2017/sort/oldest'


Instruction for launch:
1. Install node.js(see: https://nodejs.org/en/download/) and system paths.

2. Download project from repository. 

3. In the command prompt navigate to the directory:

node_modules/protractor/built

and run:
node cli.js ../../../specs/protractor.conf.js

File like 'Results for May 2018.csv' is appeared under node_modules/protractor/built.

In case of chromedriver is not compatible with the Chrome, download the driver and put it under:

node_modules/protractor/node_modules/webdriver-manager/selenium/

if the driver will have name like 'chromedriver_2.35.exe', update the node_modules/protractor/node_modules/webdriver-manager/config.json:
    "chromedriver": "2.35",

