// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import {Actor} from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import {CheerioCrawler, Dataset} from 'crawlee';

import fs from 'fs'; // Import the fs module

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

Actor.main(async () => {
    const startUrl = 'https://www.dmpublishing.cz/en/references';
    const requestQueue = await Actor.openRequestQueue();
    await requestQueue.addRequest({url: startUrl});

    const clients = [];

    const crawler = new CheerioCrawler({
        requestQueue,
        handlePageFunction: async ({ request, $ }) => {
            const language = $('html').attr('lang');
            if (language === 'en') {
                $('.list-item-wrapper.list-item-reference').each((index, element) => {
                    const name = $(element).find('.list-item-heading').text().trim();
                    const annotation = $(element).find('.list-item-anotation').text().trim();
                    const content = $(element).find('.overlay-txt.ddd').text().trim();
                    const link = $(element).find('.overlay-link a').attr('href');
                    const image = $(element).find('.list-item-image').data('src'); // Using .data('src') to get the 'data-src' attribute

                    clients.push({
                        Name: name,
                        Annotation: annotation,
                        Content: content,
                        Link: link,
                        Image: image,
                    });
                });
            }
        },
    });

    console.log('Crawler starting...');
    await crawler.run();
    console.log('Crawler finished.');

    const output = {
        TotalItems: clients.length,
        Clients: clients,
    };

    // Save the JSON data to a local file
    fs.writeFileSync('output.json', JSON.stringify(output, null, 4));
    console.log('Data saved to output.json');

    console.log('Actor finished.');

    // Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
    await Actor.exit();
});
