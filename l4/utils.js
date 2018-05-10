// Util.js is a bunch of utilities.

// load a text resource from a file over the network
const loadTextResource = function (url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function () {
        if ((request.status < 200) || (request.status > 299)) {
            callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};

const loadImage = function (url, callback) {
    const image = new Image();
    image.onload = function () {
      callback(null, image);  // just not worrying about errors 13:40
    };
    image.src = url;
};

const loadJSONResource = function (url, callback) {
    loadTextResource(url, function (err, result) {
       if (err) {
           callback(err);
       } else {
           try {
               callback(null, JSON.parse(result));
           } catch (e) {
               callback(e);
           }
       }
    });
};

