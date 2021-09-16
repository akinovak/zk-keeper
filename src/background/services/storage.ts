export async function get(key): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], function(result) {
            if(result.key) resolve(result.key);
            else resolve(null);
        });
    })
}

export async function set(key, value) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({key: value}, function() {
            resolve(null);
        });
    })
}