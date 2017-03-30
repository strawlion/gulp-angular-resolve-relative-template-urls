// import test runner and assertion library with plugins
require('mocha');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
chai.use(require('chai-string'));
// import 'gulp-angular-embed-templates' related dependencies
var resolveRelativeTemplates = require('../');
var PluginError = require('gulp-util').PluginError;
var fs = require('fs');
var File = require('gulp-util').File;
var testDir = __dirname;
var fakeDir = testDir + '/cases/hello-world';

describe('gulp-angular-resolve-relative-template-urls', function () {
    var sut;

    /**
     * synchronously read file
     *
     * @param {String} path path ot file
     * @returns {*} File object
     */
    function readFile(path) {
        return new File({
            contents: new Buffer(fs.readFileSync(path)),
            path: path
        });
    }

    /**
     * test that after embedding template in `dirName.directive` it content equals to `dirName.embedded`
     * @param {String} dirName test case directory name
     * @param {Function} done mocha 'done' handler
     * @param {Object} [config]
     */
    function testResolveRelativeTemplates(dirName, done, config) {
        var testCases = testDir + '/cases/';
        var directiveFile = readFile(testCases + dirName + '/directive.js');
        var embeddedFile = readFile(testCases + dirName + '/embedded.js');

        if (config === undefined) config = { };
        if (config.debug === undefined) config.debug = true;

        if (!config.basePath) {
            config.basePath = testDir;
        }

        sut = resolveRelativeTemplates(config);
        sut.write(directiveFile);
        sut.once('data', function (file) {
            assert(file.isBuffer());
            assert.equal(file.contents.toString('utf8'), embeddedFile.contents.toString('utf8'));
            done();
        });
    }

    /**
     * Build fake file with specified content and path == fakeDir
     * @param content
     */
    function buildFakeFile(content) {
        return new File({
            contents: new Buffer(content),
            path: fakeDir + '/fake.js'
        })
    }

    beforeEach(function() {
        // Create a 'gulp-angular-resolve-relative-template-urls' plugin stream
        sut = resolveRelativeTemplates({ debug: true, basePath: testDir });
    });

    it('should dial with single quoted template paths', function (done) {
        var fakeFile = buildFakeFile('templateUrl: \'template.html\'');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    it('should dial with double quoted template paths', function (done) {
        var fakeFile = buildFakeFile('templateUrl: "template.html"');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    it('should dial with new quotes ` in template paths', function (done) {
        var fakeFile = buildFakeFile('templateUrl: `template.html`');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    it('should dial with single quoted templateUrl key', function (done) {
        var fakeFile = buildFakeFile('\'templateUrl\': \'template.html\'');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    it('should dial with double quoted templateUrl key', function (done) {
        var fakeFile = buildFakeFile('"templateUrl": \'template.html\'');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    it('should dial with templateUrl {SPACES} : {SPACES} {url}', function (done) {
        var fakeFile = buildFakeFile('"templateUrl" \t\r\n:\r\n\t  \'template.html\'');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/cases/hello-world/template.html\'');
            done();
        });
    });

    // TODO: Reimplement
    xit('should skip errors if particular flag specified', function (done) {
        testResolveRelativeTemplates('skip-errors', done, { skipErrors: true });
    });

    it('should not skip errors if skipErrors not defined', function(done) {
        testResolveRelativeTemplates('skip-errors');

        sut.once('error', function(error) {
            assert.instanceOf(error, PluginError, 'error should be gulp PluginError');
            assert.equal(error.plugin, 'gulp-angular-resolve-relative-template-urls');
            expect(error.message).to.startWith('Can\'t access template file or it doesn\'t exist');
            done();
        });
    });

    it('should resolve path against supplied basePath', function (done) {
        sut = resolveRelativeTemplates({ basePath: testDir + '/cases/', debug: true });
        var fakeFile = buildFakeFile('templateUrl: \'template.html\'');
        sut.write(fakeFile);
        sut.once('data', function (file) {
            assert.equal(file.contents.toString('utf8'), 'templateUrl:\'/hello-world/template.html\'');
            done();
        });
    });

    it('should embed template with quotes properly', function(done) {
        testResolveRelativeTemplates('hard-attributes', done);
    });

    it('should embed hello-world template', function (done) {
        testResolveRelativeTemplates('hello-world', done);
    });

    it('should skip files if config.skipFiles function specified', function(done) {
        testResolveRelativeTemplates('skip-file', done, {skipFiles: function(file) {
            var path = file.path;
            return path.endsWith('skip-file/directive.js');
        }});
    });

    it('should skip files if config.skipFiles pattern specified', function(done) {
        testResolveRelativeTemplates('skip-file', done, {skipFiles: /skip-file\/directive\.js$/});
    });

    it('should skip certain template if config.skipTemplates regexp specified', function(done) {
        testResolveRelativeTemplates('skip-template', done, {skipTemplates: /\-large\.html$/});
    });

    it('should skip certain template if config.skipTemplates function specified', function(done) {
        testResolveRelativeTemplates('skip-template', done, {skipTemplates: function(templatePath, fileContext) {
            return templatePath.endsWith('-large.html') && fileContext.path.indexOf('skip-template') !== -1;
        }});
    });

    it('should skip certain template if /*!*/ comment specified', function(done) {
        testResolveRelativeTemplates('skip-comment', done);
    });

    it('should keep quotes if html attribute has space', function (done) {
        testResolveRelativeTemplates('img-attributes', done);
    });

});