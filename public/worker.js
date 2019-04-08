let config = {
    catchAll: false,
    catchNew: true,
    catchMatch: false,
    catchMatchString: '',
};
let remembered = {};
let numRemembered = 0;
let numUncaught = 0;

const socket = new WebSocket("ws://localhost:8999/entries");
socket.onmessage = (event) => {
    let catchIt = false;
    const seenBefore = remembered[event.data];
    if (config.catchAll) {
        catchIt = true;
    } else if (config.catchNew && !seenBefore) {
        catchIt = true;
    }
    if (!catchIt && config.catchMatch && isMatch(event.data)) {
        catchIt = true;
    }
    if (catchIt) {
        if (seenBefore) {
            remembered[event.data]++;
        } else if (numRemembered < 1000) {
            remembered[event.data] = 1;
            numRemembered++;
        }
        self.postMessage({ caughtEntry: event.data, numUncaught, numRemembered });
    } else {
        numUncaught++;
    }
};

self.onmessage = (event) => {
    const { key, value, clearMemory, moreUncaught } = event.data;
    if (key) {
        config[key] = value;
    }
    if (clearMemory) {
        remembered = {};
        numRemembered = 0;
        self.postMessage({ numRemembered });
    }
    if (moreUncaught) {
        numUncaught += moreUncaught;
    }
};

setInterval(() => {
    self.postMessage({ numUncaught: numUncaught });
}, 10 * 1000);

function isMatch(str) {
    return config.catchMatchString && str.toLowerCase().includes(config.catchMatchString.toLowerCase());
}