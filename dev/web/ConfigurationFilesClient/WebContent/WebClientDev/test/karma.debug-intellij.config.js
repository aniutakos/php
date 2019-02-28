module.exports = function (config) {
    config.set({
        client: {
            jasmine: {
                random: false
            }
        },
        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'ext-6.5.2/build/ext-all-debug.js',
            'test/karma.debug.run.js',
            'bootstrap.js',
            'test/specs/**/*.js',
            'app/**/test/specs/*.js',
            'classic/**/test/specs/*.js',
            'packages/local/**/test/specs/**/*.js'
        ],

        // list of files to exclude
        exclude: [

        ],

        proxies: {
            '/': 'http://localhost:7070/ConfigurationFilesClient',
            '/app.js': 'http://localhost:7070/ConfigurationFilesClient/test/karma.app.js'
        },

        // web server port
        port: 8081,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file
        // changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install
        // karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install
        // karma-ie-launcher`)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'html'],

        htmlReporter: {
            outputFile: 'test/karma.report.html',
            // pageTitle: 'Unit Tests',
            // subPageTitle: 'A sample project description',
            // groupSuites: true,
            // useCompactStyle: true,
            // useLegacyStyle: true
        }
    });
};