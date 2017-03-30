var fs = require('fs');
var pathModule = require('path');
var html = require('htmlparser2');

var extend = require('./utils').extend;
var RegexpProcessor = require('./RegexpProcessor');

var Angular1Processor = extend(RegexpProcessor, {
    init : function(config) {
        this._super.init(config);
    },

    /**
     * @returns {String} pattern to search
     */
    getPattern : function() {
        return '[\'"]?templateUrl[\'"]?[\\s]*:[\\s]*[\'"`]([^\'"`]+)[\'"`]';
    },

    /**
     * Find next "templateUrl:", and try to replace url with content if template available, less then maximum size.
     * This is recursive function: it call itself until one of two condition happens:
     * - error happened (error emitted in pipe and stop recursive calls)
     * - no 'templateUrl' left (call 'fileCallback' and stop recursive calls)
     *
     * @param {Object} fileContext source file content
     * @param {Object} match Regexp.exec result
     * @param {Function} cb to call after match replaced
     * @param {Function} onErr error handler
     */
    replaceMatch : function(fileContext, match, cb, onErr) {
        var relativeTemplatePath = match[1];
        var absoluteTemplatePath = pathModule.join(fileContext.path, relativeTemplatePath);

        var warnNext = function(msg) {
            this.logger.warn(msg);
            cb();
        }.bind(this);
        var onError = this.config.skipErrors ? warnNext : onErr;

        this.logger.debug('template path: %s', absoluteTemplatePath);

        var resolveRelativeTemplateUrls = this.resolveRelativeTemplateUrls.bind(this);

        fs.access(absoluteTemplatePath, function (err) {
            var canAccessFile = !err;
            if (!canAccessFile) {
                onError('Can\'t access template file or it doesn\'t exist: "' + absoluteTemplatePath + '". Error details: ' + err);
                return;
            }

            cb(resolveRelativeTemplateUrls(match, absoluteTemplatePath));
        });

    },

    resolveRelativeTemplateUrls: function(match, absoluteTemplatePath) {
        var absolutePath = '/' + pathModule.relative(this.config.basePath, absoluteTemplatePath)
        return {
            start : match.index,
            length: match[0].length,
            replace: [Buffer('templateUrl:\''), Buffer(absolutePath), Buffer('\'')]
        }
    }
});

module.exports = Angular1Processor;
