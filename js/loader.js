function loadScript(directory, files) {
    
    var head = document.querySelector('head');
    var extension = '.js';
    var index;
    
    for (index = 0; index < files.length; index++) {
        
        var path = directory + files[index] + extension;
        var script = document.createElement("script");
        script.src = path;
        script.defer = "defer";
        
        head.appendChild(script);
        
    }
    
    
    
}

function loadStyle(directory, files) {
    
    var head = document.querySelector("head");
    var extension = '.css';
    var index;
    
    
    
    for (index = 0; index < files.length; index++) {
        
        var path = directory + files[index] + extension;
        var link = document.createElement("link");
        link.href = path;
        link.type = "text/css";
        link.rel = "stylesheet";
        
        head.appendChild(link);
    
    }
    
}