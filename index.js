var fs = require('fs');
var path = require('path');
var callerId = require('caller-id');

module.exports = function(options) {
  function getMainFile(modulePath, override) {
    var json = JSON.parse(fs.readFileSync(modulePath + '/package.json'));
    //json.main could be an array..
      var main = json.main;
      var paths = [];
      if (override) {
        main = override.main;
      }
      if (Array.isArray(main)) {
        paths = main.map(function(x){
          return modulePath+"/"+x;
        });
      } else {
        paths.push(modulePath + "/" + (main || "index.js"));
      }
    return paths
  };

  function getOverride(key) {
    if (overrides[key]) {
      return overrides[key];
    }
    return null;
  }

  options = options || {};

  if(!options.nodeModulesPath) {
    options.nodeModulesPath = './node_modules';
  } else if(!path.isAbsolute(options.nodeModulesPath)) {
    var caller = callerId.getData();
    options.nodeModulesPath = path.join(path.dirname(caller.filePath), options.nodeModulesPath);
  }

  if(!options.packageJsonPath) {
    options.packageJsonPath = './package.json';
  } else if(!path.isAbsolute(options.packageJsonPath)) {
    var caller = callerId.getData();
    options.packageJsonPath = path.join(path.dirname(caller.filePath), options.packageJsonPath);
  }

  var buffer, packages, keys;
  var buffer = fs.readFileSync(options.packageJsonPath);
  var packages = JSON.parse(buffer.toString());
  var keys = [];

  var overrides = (packages.overrides) ? packages.overrides : {};


  for (var key in packages.dependencies) {
    //is there an override?
      var override = getOverride(key);
      keys = keys.concat(getMainFile(options.nodeModulesPath + "/" + key, override));
  }

  if (options.devDependencies) {
    for (var key in packages.devDependencies) {
      keys.push(getMainFile(options.nodeModulesPath + "/" + key));
    }
  }

  return keys;
};
