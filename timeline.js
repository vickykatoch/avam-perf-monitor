const fs = require('fs'),
    Chrome = require('chrome-remote-interface'),
    summary = require('./utils/timeline-metrics');
const TRACING_PERIOD = 10000; // 10 SECS
const TRACE_CATEGORIES = ["-*", "devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "blink.console", "disabled-by-default-devtools.timeline.stack", "disabled-by-default-devtools.screenshot", "disabled-by-default-v8.cpu_profile", "disabled-by-default-v8.cpu_profiler", "disabled-by-default-v8.cpu_profiler.hires"];
const options = {
    host: 'localhost',
    port: 9222,
    secure: false
};

let rawEvents = [];
Chrome(options, (chrome) => {
    debugger;
    console.log(chrome);
    console.info('Successfully connected to : CHROME DEV TOOLS');
    const { Page, HeapProfiler, Tracing } = chrome;
    Page.enable();
    console.info('Starting the profiling');
    Tracing.start({
        "categories": TRACE_CATEGORIES.join(','),
        "options": "sampling-frequency=10000"  // 1000 is default and too slow.
    });

    Tracing.tracingComplete(() => {
        let file = 'profile-' + Date.now() + '.devtools.trace';
        fs.writeFileSync(file, JSON.stringify(rawEvents, null, 2));
        console.log('Trace file: ' + file);
        console.log('You can open the trace file in DevTools Timeline panel. (Turn on experiment: Timeline tracing based JS profiler)\n')
        summary.report(file); // superfluous
        // chrome.close();
        process.exit(0);
    });

    Tracing.dataCollected((data) => {
        var events = data.value;
        rawEvents = rawEvents.concat(events);
        // this is just extra but not really important
        summary.onData(events)
    });
    chrome.Schema.getDomains(x=> {
        console.log('Domains : ', JSON.stringify(x));
    });

    const waitHandle = setTimeout(()=> {
        clearTimeout(waitHandle);
        Tracing.end();
    },TRACING_PERIOD);

}).on('error', error => {
    debugger;
    console.error(`Error while connecting to CHROME DEV TOOLS :\n ${JSON.stringify(error)}`);
});

// Chrome(function (chrome) {
//     with (chrome) {
//         Page.enable();
        // Tracing.start({
        //     "categories":   TRACE_CATEGORIES.join(','),
        //     "options":      "sampling-frequency=10000"  // 1000 is default and too slow.
        // });

//         Page.navigate({'url': 'http://paulirish.com'})
//         Page.loadEventFired(function () {
//            Tracing.end()
//         });

        // Tracing.tracingComplete(function () {
        //     var file = 'profile-' + Date.now() + '.devtools.trace';
        //     fs.writeFileSync(file, JSON.stringify(rawEvents, null, 2));
        //     console.log('Trace file: ' + file);
        //     console.log('You can open the trace file in DevTools Timeline panel. (Turn on experiment: Timeline tracing based JS profiler)\n')

        //     summary.report(file); // superfluous

        //     chrome.close();
        // });

        // Tracing.dataCollected(function(data){
        //     var events = data.value;
        //     rawEvents = rawEvents.concat(events);

        //     // this is just extra but not really important
        //     summary.onData(events)
        // });

//     }
// }).on('error', function (e) {
//     console.error('Cannot connect to Chrome', e);
// });