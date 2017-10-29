const cdp = require('chrome-remote-interface');
const options = {
    host : 'localhost',
    port : 9222,
    secure : false
};

const profilePromise = new Promise((resolve,reject)=> {
    cdp(options).then(x=> {
        resolve(x);
    } ).catch(err => {
        console.log('ERROR');
        reject(err);
    });
});

function onConnected(cdpProxy) {
    const {Profiler, Page, Runtime} = cdpProxy;
    Page.enable().then(x=> {
        Profiler.enable().then(x=> {
            debugger;
            Page.navigate('http://localhost:4200/');
            
        });
    });
    console.log(cdpProxy);
}


profilePromise.then(onConnected).catch(err=> {
    console.error(err);
});
