# gulp-angular-resolve-relative-template-urls

----

Plugin searches for `templateUrl: {relativeUrl}` and replaces it with `templateUrl: {absoluteUrl}`.

## Install

    npm install --save-dev gulp-angular-resolve-relative-template-urls

## Usage (Angular 1.x)

Given the following file structure

```javascript
src
+-hello-world
  |-hello-world-directive.js
  +-hello-world-template.html
```

`hello-world-directive.js`:

```javascript
angular.module('test').directive('helloWorld', function () {
    return {
        restrict: 'E',
        // relative path to template
        templateUrl: 'hello-world-template.html'
    };
});
```

`hello-world-template.html`:

```html
<strong>
    Hello world!
</strong>
```

`gulpfile.js`:

```javascript
var gulp = require('gulp');
var resolveRelativeTemplateUrls = require('gulp-angular-resolve-relative-template-urls');

gulp.task('js:build', function () {
    gulp.src('src/scripts/**/*.js')
        .pipe(resolveRelativeTemplateUrls({
            basePath: './src',
        }))
        .pipe(gulp.dest('./dist'));
});
```

*gulp-angular-resolve-relative-template-urls* will generate the following file:

```javascript
angular.module('test').directive('helloWorld', function () {
    return {
        restrict: 'E',
        templateUrl:'/hello-world/hello-world-template.html',
    };
});
```

**Note**: call _resolveRelativeTemplateUrls_ before source maps initialization.

## API

### resolveRelativeTemplateUrls(options)

#### options.basePath
Type: `String`. The path against which the absolute path to the templates are resolved. Normally this is the path to the base folder from which your html files are served.

#### options.transformUrl
Type: `Function`. Allows transforming the resolved absolute url. Useful for cases where files are written to a directory structure that is different from their source location. Example: `function(templateUrl) { return '/static/' + templateUrl; }`

#### options.skipFiles
Type: `RegExp` or `Function`. By default: do not skip any files. RegExp can test file name to skip template embedding, but this file will still be passed through the general gulp pipe and be visible for all of the following plugins. Example: `function(file) {return file.path.endsWith('-skip-directive.js');}`

#### options.skipTemplates
Type: `RegExp` or `Function`. By default: do not skip any templates. RegExp can test concrete templateUrl to skip it (like `/\-large\.html$/`). Example: `function(templatePath, fileContext) {return templatePath.endsWith('-large.html');}`

#### options.skipErrors
Type: `Boolean`. Default value: 'false'

should plugin brake on errors (file not found, error in minification) or skip errors (warn in logs) and go to next template

#### options.jsEncoding
Type: `String`. Default value: 'utf-8'

js files encoding (angular directives)

## License
This module is released under the MIT license.


