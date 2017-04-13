var mainNpmFiles = require('../');
var upath = require('upath');

require('should');

describe('main-npm-files', function() {
  function expect(filenames) {
      var expectedFiles = [].concat(filenames).map(function(filename) {
          return upath.join(__dirname, filename);
      });

      function run(path, options, done) {
          options = options || {};

          if (!options.packageJsonPath) {
            options.packageJsonPath = __dirname + path;
          }

          if (!options.nodeModulesPath) {
            options.nodeModulesPath = __dirname + "/fixtures";
          }

          var srcFiles = mainNpmFiles(options);
          srcFiles = srcFiles.map(function(x) {
              return upath.toUnix(x);
          })
          srcFiles.should.be.eql(expectedFiles);

          if (done) {
              done();
          }
      }

      return {
          fromConfig: function(path, options) {
              return {
                  when: function(done) {
                      run(path, options, done);
                  }
              };
          }
      };
  }

  it('should select the expected files with dependency', function(done) {
      expect([
          '/fixtures/module1/index.js',
          '/fixtures/module1/index2.js',
          '/fixtures/module2/dist/index.js'
      ])
      .fromConfig('/_package.json')
      .when(done);
  });
});
