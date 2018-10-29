/**
 * Created by agultsov on 09/18/18.
 */

let helper = require('../helper.js');
let config = require('../config/defaultConfig');
let fs = require('fs');


// in such case we can use any token
let getMonth = function (month) {
    if( month !== undefined)
        // (        && (month === "Jan" || month === "Feb" || month === "Mar" || month === "Apr"
        // || month === "May" || month === "Jun" || month === "Jul" || month === "Aug"
        // || month === "Sep" || month === "Oct" || month === "Nov" || month === "Dec")
     {
        return month;
    }
    else
        return undefined;
};

let fileName;
if(getMonth(config.PROPERTIES.MONTH) !== undefined) {
    fileName = "./Results for " + config.PROPERTIES.MONTH + " " + config.PROPERTIES.YEAR + ".csv";
}
else {
    fileName = "./Results for " + config.PROPERTIES.YEAR + ".csv";
}


let addToFile = function (text) {
    fs.appendFile(fileName, text, 'utf-8', function (err) {
        if (err) {
            browser.logger.error('Some error occurred - append to file either not saved or corrupted file saved.');
        } else {
            // browser.logger.info('Text is added!');
        }
    });
};

let xPathToGetSaleTitle = "//div[@class='sale-title-banner']";
let saleCategory = element(by.xpath(xPathToGetSaleTitle + "//strong"));

let date = element(by.xpath(xPathToGetSaleTitle + "//span"));

let delimiter = ",";
// --> ====================== Main function to store the data
let storeTheData = function () {
    let lotInfo = element(by.xpath("//div[@class='lot-information']"));

    let skipLastComma = false;

    let currUrl = browser.getCurrentUrl();
    currUrl.then(function (lotURL) {
        if (lotURL.includes("not-found")) {   //  We need to verify if it exists
            // browser.logger.warn("url contains not-found, lets skip."); // debug
        }
        else {
            // browser.logger.info("Let's add.");

            helper.waitElementToAppearInDOM(lotInfo, 50000);
            helper.waitElementToBeDisplayed(lotInfo, 50000);

            // if we have button 'Read More' let's expand
            let readMore = element(by.xpath("//button[@class='show-more-button']"));
            readMore.isPresent().then(function (isPresent) {
                if(isPresent === true) { // so we have such button and need to click
                    helper.waitElementToBeDisplayed(readMore);
                    readMore.click();
                }
            });

            // 1) write the Sale
            helper.waitElementToAppearInDOM(saleCategory);
            helper.waitElementToBeDisplayed(saleCategory);
            saleCategory.getText().then(function (text) {
                // browser.logger.info("saleCategory=" + text); // debug
                text = text.replace(/[\n\r]/g, ' ');
                addToFile('"' + text + '"');
            });

            // 2) 3) write the Date and location
            helper.waitElementToAppearInDOM(date);
            helper.waitElementToBeDisplayed(date);
            date.getText().then(function (text) {
                text = text.replace("EVENING SALE\n", '');
                text = text.replace("THE FARBER COLLECTION\n", '');
                text = text.replace("COLLECTION\n", '');
                text = text.replace(/[\n]/, '"' + delimiter + '"'); // we know the only location has a new line
                text = text.replace(/[\n\r]/g, '');
                // browser.logger.info("date=" + text);    // debug
                addToFile(delimiter + '"' + text + '"');
            });

            // 4) write the image
            let image = element(by.xpath("//div[@class='phillips-image main-lot-image']/img"));
            helper.waitElementToAppearInDOM(image);
            image.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    image.getAttribute('src').then(function (text) {
                        addToFile(delimiter + '"' + text + '"');
                    });
                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        addToFile(delimiter);
                    });
                }
            });

            // 5) write the artist
            let artist = element(by.xpath("//div[@class='lot-page-maker']/a/h2"));
            helper.waitElementToAppearInDOM(artist);
            artist.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    artist.getText().then(function (text) {
                        text = text.replace(/"/g, "'"); // replace the " with '
                        text = text.replace(/[\n\r]/g, ' ');
                        addToFile(delimiter + '"' + text + '"');
                    });
                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        addToFile(delimiter);
                    });
                }
            });


            // 6) write the title
            let title = element(by.xpath("//div[@class='lot-information']//p[@class='title']"));
            helper.waitElementToAppearInDOM(title);
            title.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    title.getText().then(function (text) {
                        text = text.replace(/"/g, "'"); // replace the " with '
                        text = text.replace(/[\n\r]/g, ' ');
                        addToFile(delimiter + '"' + text + '"');
                    });
                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        addToFile(delimiter);
                    });
                }
            });

            //--> workaround for 27 Nov 2017, 28 May 2018 write only description
            if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_onlydescription") {
                // 7) write the Lot date
                lotInfo.getText().then(function (lotText) {
                    addToFile(delimiter);   //  comma for year
                });

                // 8) write the Description
                let description = element(by.xpath("//ul[@class='bullet-list']"));
                description.isPresent().then(function (isPresent) {
                    if (isPresent === true) {
                        description.getText().then(function (text) {
                            text = text.replace(/"/g, "'"); // replace the " with '
                            text = text.replace(/[\n\r]/g, ' ');
                            addToFile(delimiter + '"' + text + '"');
                        });
                    }
                    else {
                        lotInfo.getText().then(function (lotText) {
                            addToFile(delimiter);
                        });
                    }
                });
                // 9) write the Dimensions
                lotInfo.getText().then(function (lotText) {
                    addToFile(delimiter);   //  comma for dimensions
                });
                // 10) write the More details
                lotInfo.getText().then(function (lotText) {
                    addToFile(delimiter);   //  comma for more details
                });
            }
            //<-- workaround for 27 Nov 2017, write only description
            else {
                // 7) write the Lot date
                let lotDate = undefined;
                // let lotDate = element(by.xpath("//div[@class='lot-information']//p[3]/span[1]")); // 1 Dec 2015 only
                // let lotDate = element(by.xpath("//ul[@class='bullet-list']//li[1]//p")); // issue with Dec 2014, Nov 2015, etc
                if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "standard") {
                    lotDate = element(by.xpath("//div[@class='lot-information']//p[2]/span[1]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_1dec2015") {
                    lotDate = element(by.xpath("//div[@class='lot-information']//p[3]/span[1]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_dec2014") {
                    lotDate = element(by.xpath("//ul[@class='bullet-list']//li[1]//p"));
                }

                lotDate.isPresent().then(function (isPresent) {
                    if(isPresent === true ) {
                        lotDate.getText().then(function (text) {
                            text = text.replace(/"/g, "'"); // replace the " with '
                            if(
                                (text.includes("0") || text.includes("1") || text.includes("2") || text.includes("3")
                                || text.includes("4") || text.includes("5") || text.includes("6") || text.includes("7")
                                || text.includes("8") || text.includes("9"))
                                && (!text.includes("(0") || !text.includes("(1") || !text.includes("(2") || !text.includes("(3")
                                || !text.includes("(4") || !text.includes("(5") || !text.includes("(6") || !text.includes("(7")
                                || !text.includes("(8") || !text.includes("(9"))
                            // (text.startsWith("0") || text.startsWith("1") || text.startsWith("2") || text.startsWith("3") // issue with Dec 2014, Nov 2015, etc
                            // || text.startsWith("4") || text.startsWith("5") || text.startsWith("6") || text.startsWith("7")
                            // || text.startsWith("8") || text.startsWith("9"))

                            )
                            { // and it contains any digit
                                text = text.replace(/[\n\r]/g, ' ');
                                addToFile(delimiter + '"' + text + '"');
                            }
                            else {
                                skipLastComma = true;
                                addToFile(delimiter + delimiter + '"' + text + '"');
                            }

                        });
                    }
                    else {
                        lotInfo.getText().then(function (lotText) {
                            addToFile(delimiter);
                        });
                    }
                });

                // 8) write the Description
                let description = undefined;
                    // element(by.xpath("//div[@class='lot-information']//p[2]/span[2]"));
                // let description = element(by.xpath("//div[@class='lot-information']//p[3]/span[2]")); // 1 Dec 2015 only
                // let description = element(by.xpath("//ul[@class='bullet-list']//li[2]//p")); // issue with Dec 2014, Nov 2015, etc
                if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "standard") {
                    description = element(by.xpath("//div[@class='lot-information']//p[2]/span[2]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_1dec2015") {
                    description = element(by.xpath("//div[@class='lot-information']//p[3]/span[2]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_dec2014") {
                    description = element(by.xpath("//ul[@class='bullet-list']//li[2]//p"));
                }

                description.isPresent().then(function (isPresent) {
                    if(isPresent === true) {
                        description.getText().then(function (text) {
                            text = text.replace(/"/g, "'"); // replace the " with '
                            text = text.replace(/[\n\r]/g, ' ');
                            addToFile(delimiter + '"' + text + '"');
                        });
                    }
                    else {
                        lotInfo.getText().then(function (lotText) {
                            addToFile(delimiter);
                        });
                    }
                });

                // 9) write the Dimensions
                let dimensions = undefined;
                    // element(by.xpath("//div[@class='lot-information']//p[2]/span[3]"));
                // let dimensions = element(by.xpath("//div[@class='lot-information']//p[3]/span[3]")); // 1 Dec 2015 only
                // let dimensions = element(by.xpath("//ul[@class='bullet-list']//li[222]//p")); // issue with Dec 2014, Nov 2015, etc, just for empty Dimensions
                if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "standard") {
                    dimensions = element(by.xpath("//div[@class='lot-information']//p[2]/span[3]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_1dec2015") {
                    dimensions = element(by.xpath("//div[@class='lot-information']//p[3]/span[3]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_dec2014") {
                    dimensions = element(by.xpath("//ul[@class='bullet-list']//li[222]//p"));
                }

                dimensions.isPresent().then(function (isPresent) {
                    if(isPresent === true) {
                        dimensions.getText().then(function (text) {
                            text = text.replace(/"/g, "'"); // replace the " with '
                            text = text.replace(/[\n\r]/g, ' ');
                            addToFile(delimiter + '"' + text + '"');
                        });
                    }
                    else {
                        lotInfo.getText().then(function (lotText) {
                            addToFile(delimiter);
                        });
                    }
                });

                // 10) write the More details
                let moreDetails = undefined;
                    // element(by.xpath("//div[@class='lot-information']//p[2]/span[4]"));
                // let moreDetails = element(by.xpath("//div[@class='lot-information']//p[3]/span[4]")); // 1 Dec 2015 , 31 May 2016
                // let moreDetails = element(by.xpath("//ul[@class='bullet-list']//li[3]//p")); // issue with Dec 2014, Nov 2015, etc
                if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "standard") {
                    moreDetails = element(by.xpath("//div[@class='lot-information']//p[2]/span[4]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_1dec2015") {
                    moreDetails = element(by.xpath("//div[@class='lot-information']//p[3]/span[4]"));
                }
                else if(config.PROPERTIES.GRAB_MODE.toLowerCase() === "wrkrnd_dec2014") {
                    moreDetails = element(by.xpath("//ul[@class='bullet-list']//li[3]//p"));
                }

                moreDetails.isPresent().then(function (isPresent) {
                    if(isPresent === true) {
                        moreDetails.getText().then(function (text) {
                            text = text.replace(/"/g, "'"); // replace the " with '
                            text = text.replace(/[\n\r]/g, ' ');
                            addToFile(delimiter + '"' + text + '"');
                        });
                    }
                    else {
                        lotInfo.getText().then(function (lotText) {
                            if(!skipLastComma) {
                                addToFile(delimiter);
                            }

                        });
                    }
                });
            }


            // 11) write the Estimate
            let estimate = element(by.xpath("//div[@class='lot-information']//p[@class='estimates']"));
            estimate.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    estimate.getText().then(function (text) {
                        text = text.replace(/[\n\r]/g, ' ');
                        text = text.replace("Estimate", '');
                        addToFile(delimiter + '"' + text + '"');

                        // browser.logger.info("Estimate=" + text); // debug
                    });
                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        addToFile(delimiter);
                    });
                }
            });

            // 12) write the Sold
            let sold = element(by.xpath("//div[@class='lot-information']//p[@class='sold']"));

            sold.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    sold.getText().then(function (text) {
                        addToFile(delimiter + '"' + text + '"');
                    });
                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        addToFile(delimiter);
                    });
                }
            });

            // 13) write the Provenance
            //div[@class='lot-page-details']//li/p[2]
            let provenanceXpath = "//div[@class='lot-page-details']//li/p/strong[contains(text(),'Provenance')]/../../p[2]";
            let provenance = element(by.xpath(provenanceXpath));
            provenance.isPresent().then(function (isPresent) {
                if(isPresent === true) {
                    provenance.getText().then(function (text) {
                        text = text.replace(/"/g, "'"); // replace the " with '
                        text = text.replace(/[\n\r]/g, ' ');
                        // addToFile(delimiter + '"' + text + '"' + "\n"); // without URL
                        addToFile(delimiter + '"' + text + '"'); // + "\n"); // with URL
                    });

                }
                else {
                    lotInfo.getText().then(function (lotText) {
                        // addToFile(delimiter + "\n"); // without URL
                        addToFile(delimiter); // + "\n"); // with URL
                    });
                }
            });


            // 14)write the lot's URL // with URL
            lotInfo.getText().then(function (lotText) {
                addToFile(delimiter + '"' + lotURL + '"');
            });

            // // 15)"Exhibited"
            // let exhibitedXpath = "//div[@class='lot-page-details']//li/p/strong[contains(text(),'Exhibited')]/../../p[2]";
            // let exhibited = element(by.xpath(exhibitedXpath));
            // exhibited.isPresent().then(function (isPresent) {
            //     if(isPresent === true) {
            //         exhibited.getText().then(function (text) {
            //             text = text.replace(/"/g, "'"); // replace the " with '
            //             text = text.replace(/[\n\r]/g, ' ');
            //             addToFile(delimiter + '"' + text + '"');
            //         });
            //
            //     }
            //     else {
            //         lotInfo.getText().then(function (lotText) {
            //             addToFile(delimiter);
            //         });
            //     }
            // });
            //
            // // 16)"Literature"
            // let literatureXpath = "//div[@class='lot-page-details']//li/p/strong[contains(text(),'Literature')]/../../p[2]";
            // let literature = element(by.xpath(literatureXpath));
            // literature.isPresent().then(function (isPresent) {
            //     if(isPresent === true) {
            //         literature.getText().then(function (text) {
            //             text = text.replace(/"/g, "'"); // replace the " with '
            //             text = text.replace(/[\n\r]/g, ' ');
            //             addToFile(delimiter + '"' + text + '"');
            //         });
            //
            //     }
            //     else {
            //         lotInfo.getText().then(function (lotText) {
            //             addToFile(delimiter);
            //         });
            //     }
            // });
            //
            // // 17)"Catalogue Essay"
            // let catalogueEssayXpath = "//div[@class='lot-page-details']//li[@class='essay']//div[@class='lot-essay']/p";
            // let catalogueEssay = element(by.xpath(catalogueEssayXpath));
            // catalogueEssay.isPresent().then(function (isPresent) {
            //     if(isPresent === true) {
            //         catalogueEssay.getText().then(function (text) {
            //             text = text.replace(/"/g, "'"); // replace the " with '
            //             text = text.replace(/[\n\r]/g, ' ');
            //             addToFile(delimiter + '"' + text + '"');
            //         });
            //
            //     }
            //     else {
            //         lotInfo.getText().then(function (lotText) {
            //             addToFile(delimiter);
            //         });
            //     }
            // });
            //
            // // 18)"Artist Info"
            // let artistInfoXpath = "//div[@class='lot-page-details']//li[@class='artist-biography']//p[@class='artist-info']";
            // let artistInfo = element(by.xpath(artistInfoXpath));
            // artistInfo.isPresent().then(function (isPresent) {
            //     if(isPresent === true) {
            //         artistInfo.getText().then(function (text) {
            //             text = text.replace(/"/g, "'"); // replace the " with '
            //             text = text.replace(/[\n\r]/g, ' ');
            //             addToFile(delimiter + '"' + text + '"');
            //         });
            //
            //     }
            //     else {
            //         lotInfo.getText().then(function (lotText) {
            //             addToFile(delimiter);
            //         });
            //     }
            // });
            //
            // // 19)"Artist Bio"
            // let artistBioXpath = "//div[@class='lot-page-details']//li[@class='artist-biography']//div[@class='artist-bio']";
            // let artistBio = element(by.xpath(artistBioXpath));
            // artistBio.isPresent().then(function (isPresent) {
            //     if(isPresent === true) {
            //         artistBio.getText().then(function (text) {
            //             text = text.replace(/"/g, "'"); // replace the " with '
            //             text = text.replace(/[\n\r]/g, ' ');
            //             let textToReplase = "View More Works";
            //             text = text.replace(textToReplase, '');
            //             addToFile(delimiter + '"' + text + '"');
            //         });
            //
            //     }
            //     else {
            //         lotInfo.getText().then(function (lotText) {
            //             addToFile(delimiter);
            //         });
            //     }
            // });

            lotInfo.getText().then(function (lotText) {
                addToFile("\n"); // end of the line
            });

        }
    });
}; // <-- ====================== Main function to store the data

describe('Grab the past auction results from Phillips.', function() {

    beforeEach(function () {
        browser.logger.info("***** Spec 'grabResults' started. *****");
        if (fs.existsSync(fileName)) {
             fs.unlink(fileName);
         }
    });


    afterEach(function () {
        browser.logger.info("***** Spec 'grabResults' finished. *****");
    });


    it("Spec 'grabResults': Depend on the input params we gather results and save in *.csv.", function () {
        browser.ignoreSynchronization = true;

        if(config.PROPERTIES.BASE_URL === undefined || config.PROPERTIES.YEAR === undefined || config.PROPERTIES.GRAB_MODE === undefined) {
            browser.logger.error("Please check the BASE_URL, YEAR or GRAB_MODE in the configuration file!");
            fail();
        }

        // here should be baseUrl
        let startURL = config.PROPERTIES.BASE_URL + config.PROPERTIES.YEAR;
        // let startURL = "https://www.phillips.com/auctions/past/filter/Year=2017/sort/oldest/page/5"; // debug
        browser.get(startURL);

        // let's count the pages here
        let totalResultsXpath = "//div[@id='info-backbone']/span[@class='total']";
        let totalResults = element(by.xpath(totalResultsXpath));

        helper.waitElementToAppearInDOM(totalResults); // ensure the page is loaded
        helper.waitElementToBeDisplayed(totalResults); // ensure the page is loaded

        // accept the cookie
        let alertCookieAccept = element(by.xpath("//div[@class='phillips-alert']//button[@class='alert-button']"));
        alertCookieAccept.isPresent().then(function (isPresent) {
           if(isPresent === true) {
               alertCookieAccept.click();
           }
        });

        // choose the sorting
        if(config.PROPERTIES.SORT_BY !== undefined) {
            let selectXpath = "//div[@id='sort-backbone-md']/select";
            let sortBy = element(by.xpath(selectXpath));

            helper.waitElementToAppearInDOM(sortBy); // ensure the select is loaded
            helper.waitElementToBeDisplayed(sortBy); // ensure the select is loaded

            sortBy.click();

            let optionToChoose = element(by.xpath(selectXpath + "/option[contains(text(),'" + config.PROPERTIES.SORT_BY + "')]"));

            helper.waitElementToAppearInDOM(optionToChoose);
            helper.waitElementToBeDisplayed(optionToChoose);
            optionToChoose.click();

            helper.waitElementToAppearInDOM(totalResults); // ensure the page is loaded
            helper.waitElementToBeDisplayed(totalResults); // ensure the page is loaded

            browser.logger.info("Sorting to the results by:" + config.PROPERTIES.SORT_BY);
        }

        let currentUrl = "";
        // staring the processing results
        let mainTask = function () {
            // --> Get Current URL
            helper.delay(500);
            // let currentUrl = browser.getCurrentUrl();
            currentUrl = browser.getCurrentUrl();
            currentUrl.then(function (currUrl) {

                let urlToNavigate = currUrl; //
                // urlToNavigate = "https://www.phillips.com/auctions/past/filter/Year=2018/sort/oldest/page/4"; // debug

                browser.get(urlToNavigate);
                browser.logger.info("Navigate to the=" + urlToNavigate);
                helper.waitElementToAppearInDOM(totalResults); // ensure the page is loaded
                helper.waitElementToBeDisplayed(totalResults); // ensure the page is loaded

                let xPathToFindLinks = "";
                let month = config.PROPERTIES.MONTH;

                if(getMonth(month) !== undefined) {
                    xPathToFindLinks = "//li[contains(@class,'auction')]//h3/a[contains(text(), '" + month + "')]/../..//h2/a[@href]";
                    browser.logger.info("Find by=" + month);
                }
                else {
                    xPathToFindLinks = "//li[contains(@class,'auction')]//h2/a[@href]";
                }

                // all auction results per page
                let resultsPerPageLevel2 = element.all(by.xpath(xPathToFindLinks));

                // --> Sub cycle for iterate per every auction on the page
                resultsPerPageLevel2.count().then(function (count) {
                    browser.logger.info("Categories to be processed from the page: count=" + count);

                    for(let j = 0; j < count; j++) { // between the categories on page
                        helper.waitElementToAppearInDOM(resultsPerPageLevel2.get(j));
                        helper.waitElementToBeDisplayed(resultsPerPageLevel2.get(j));
                        resultsPerPageLevel2.get(j).click();

                        // let xPathToGetSaleTitle = "//div[@class='sale-title-banner']";
                        // let saleCategory = element(by.xpath(xPathToGetSaleTitle + "//strong"));

                        helper.waitElementToAppearInDOM(saleCategory);
                        helper.waitElementToBeDisplayed(saleCategory);

                        saleCategory.getText().then(function (text) {
                            browser.logger.info("Processing the: saleCategory=" + text);
                        });

                        // we can get the detailed pages, so let's iterate between them
                        let allDetailedLinks =  element.all(by.xpath("//div[@role='button']//a[contains(@class,'description')]"));

                        // wait up to 1 minute for all the results loaded first time
                        helper.waitElementToAppearInDOM(allDetailedLinks.last(), 60000);

                        allDetailedLinks.last().isPresent().then(function (isPresent) {
                            if(isPresent === true) {
                                allDetailedLinks.count().then(function (count) {
                                    browser.logger.info("Lots to be processed from the category: count=" + count);

                                    // --> worked in the past but for some reason no longer, it looks like site issue
                                    for(let i = 0; i < count; i++) { // i = 0, or we can choose any lot to start processing with
                                        allDetailedLinks.get(i).getAttribute('href').then(function (href) {
                                            // browser.logger.info("i="+ i + "href=" + href); // debug
                                            if(href !== undefined && (href.includes("https:") || href.includes("http:"))) {
                                                browser.get(href);
                                                storeTheData();
                                            }
                                        });
                                    }
                                    // <-- worked in the past but for some reason no longer

                                    // // --> let's try select options again but results can be not valid due to page not found
                                    // allDetailedLinks.first().click(); //
                                    // // allDetailedLinks.get(1).click(); // click on 3rd
                                    // let select = element(by.xpath("//select[@name='lotNumber']"));
                                    //
                                    // helper.waitElementToAppearInDOM(select);
                                    //
                                    // select.isPresent().then(function (isPresent) {
                                    //    if(isPresent === true) {
                                    //        // -->
                                    //        let options = element.all(by.xpath("//select[@name='lotNumber']/option"));
                                    //        let item = 1;
                                    //        options.each(function(elem, index) {
                                    //            item = index + 1;
                                    //            helper.waitElementToAppearInDOM(select);
                                    //
                                    //            helper.waitElementToBeDisplayed(select); // here we need to handle most likely just go back click on previous link
                                    //            select.click();
                                    //
                                    //            let optionToChoose = element(by.xpath("//select[@name='lotNumber']/option[" + item + "]"));
                                    //
                                    //            helper.waitElementToAppearInDOM(optionToChoose);
                                    //            helper.waitElementToBeDisplayed(optionToChoose);
                                    //            optionToChoose.click();
                                    //            // =============
                                    //            storeTheData();
                                    //            // =============
                                    //        }); // <-- options.each() End
                                    //    }
                                    //    else {
                                    //        browser.logger.error("There is no 'select' on the lot's detail page." +
                                    //            " Unable to process the results from the category!");
                                    //    }
                                    //
                                    // });
                                    // <-- let's try select options again
                                });
                            }
                            else {
                                    browser.logger.error("Unable to click on the lot's detail page." +
                                        " Unable to process the results from the category!");
                                }
                        });

                        saleCategory.getText().then(function (text) {
                            browser.logger.info("Processed the: saleCategory=" + text);
                        });
                        // <-- Sub cycle level 3 for grabbing the auction lots End

                        helper.delay(500);
                        browser.get(urlToNavigate);
                        helper.delay(500);
                        helper.waitElementToAppearInDOM(totalResults); // ensure the page is loaded
                        helper.waitElementToBeDisplayed(totalResults); // ensure the page is loaded
                    }
                });

            });// <-- Get Current URL End
        };

        let nextPageArrow = element(by.xpath("//div[@id='past-auctions-page']//li/a[@class='next']"));

        let firstPage = true;
        let condition = true; // just for checking
        let ifPresent = function (conditionToCheck) {
            helper.waitElementToAppearInDOM(totalResults); // ensure the page is loaded
            helper.waitElementToBeDisplayed(totalResults); // ensure the page is loaded
            nextPageArrow.isPresent().then(function (isPresent) {
                if (isPresent === conditionToCheck) { // true != false
                    // here the body of the task


                    if(firstPage) {
                        mainTask();
                        // browser.logger.info("first=" + "true"); debug
                        firstPage = false;
                    }
                    else {
                        // browser.logger.info("first=" + "false"); debug
                        nextPageArrow.click();
                        helper.delay(500);
                        mainTask();
                    }

                    // mainTask();  worked fine
                    // nextPageArrow.click();

                    ifPresent(conditionToCheck);
                } // if present === true End
                else { // but we need to get the results from the last page
                    if(firstPage) {
                        mainTask();
                    }

                }
            });
        }; // ifPresent End


        // build the head
        let headRow = "Sale" + delimiter + "Date" + delimiter + "Location" + delimiter + "Image"
            + delimiter + "Artist" + delimiter + "Title" + delimiter + "Lot date"
            + delimiter + "Description" + delimiter + "Dimensions" + delimiter + "More details"
            + delimiter + "Estimate" + delimiter + "Sold" + delimiter + "Provenance"
            + delimiter + "Lot URL" // with URL
                // going to store if exists 4 columns
            // + delimiter + "Exhibited" + delimiter + "Literature"  + delimiter + "Catalogue Essay" + delimiter + "Artist Info" + delimiter + "Artist Bio"
            + "\n";
        addToFile(headRow);

        ifPresent(condition);

}); // It End

});

