// npm i
// npm install --save-dev gulp gulp-autoprefixer gulp-csscomb gulp-imagemin gulp-minify-css gulp-rename gulp-rigger gulp-rimraf gulp-sass gulp-sourcemaps gulp-uglify gulp-watch imagemin-pngquant rimraf main-bower-files  gulpSequence gulp-main-bower-files browser-sync node-bourbon
// bower i
// gulp bowerFiles
// gulp (watch)
// gulp build

'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    csscomb = require('gulp-csscomb'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    sourcemaps = require('gulp-sourcemaps'),
    mainBowerFiles = require('main-bower-files'),
    sass = require('gulp-sass'),
    rimraf = require('rimraf'),
    gulprimraf = require('gulp-rimraf'),
    bourbon = require('node-bourbon'),
    concat = require('gulp-concat'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    pngquant = require('imagemin-pngquant');


// bowerFiles
/////////////////////////////////////////
// bowerJs

        gulp.task('bowerJs', function() {
            return gulp.src(mainBowerFiles('**/*.js'))
                .pipe(gulp.dest('src/js/vendors'))
        });
// concatJs

   gulp.task('concatJs', function() {
     return gulp.src('src/js/vendors/*.js')
       .pipe(concat('scripts.min.js'))
       .pipe(gulp.dest('src/js/'));
   });
// bowerCss

        gulp.task('bowerCss', function() {
            return gulp.src(mainBowerFiles('**/*.css', { base: process.cwd() }))
            .pipe(rename({
                prefix: "_",
                extname: ".scss"
              }))
            .pipe(gulp.dest('src/scss'))
        });

// bowerfiles

    gulp.task('bowerFiles', gulpSequence(
        ['bowerJs', 'bowerCss'],
        ['concatJs']
    ));
// DEV
/////////////////////////////////////////
// scss

    gulp.task('scss-dev', function () {
      gulp.src('src/scss/**/*.scss')
      .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths
            }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/css/'))
        .pipe(reload({stream: true}));
    });
// html

    gulp.task('html-dev', function () {
        gulp.src('src/template/*.html')
            .pipe(rigger())
            .pipe(gulp.dest('src/'))
            .pipe(reload({stream: true}));
    });
// js

    gulp.task('js-dev', function () {
        gulp.src('src/js/*.js')
            .pipe(gulp.dest('src/js'))
            .pipe(reload({stream: true}));
    });

// img

    gulp.task('img-dev', function () {
        gulp.src('src/img/**/*')
        .pipe(reload({stream: true}));
    });
// fonts

    gulp.task('fonts-dev', function () {
        gulp.src('src/fonts/**/*')
        .pipe(reload({stream: true}));
    });
// webserver

    var config = {
        server: {
            baseDir: "./src"
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "igor"
    };
    gulp.task('webserver', function () {
        browserSync(config);
    });

// WATCH

    gulp.task('watch', function(){
        watch(['src/template/**/*.html'], function(event, cb) {
            gulp.start('html-dev');
        });
        watch(['src/js/vendors/*.js'], function(event, cb) {
            gulp.start('concatJs');
        });
        watch(['src/js/*.js'], function(event, cb) {
            gulp.start('js-dev');
        });
        watch(['src/scss/**/*.scss'], function(event, cb) {
            gulp.start('scss-dev');
        });
        watch(['src/img/**/*'], function(event, cb) {
            gulp.start('img-dev');
        });
        watch(['src/fonts/**/*'], function(event, cb) {
            gulp.start('fonts-dev');
        });
    });


gulp.task('default', [
    'watch',
    'webserver',
    'browser-sync'
]);



// BUILD
/////////////////////////////////////////
// del

    gulp.task('del', function (cb) {
        rimraf('./build', cb);
    });
// html

     gulp.task('html', function () {
         gulp.src('src/*.html')
             .pipe(gulp.dest('build/'))
     });
// css

    gulp.task('css', function () {
        gulp.src('src/css/*.css')
        .pipe(autoprefixer('last 15 versions'))
        .pipe(csscomb())
        .pipe(gulp.dest('build/css/'))
    });
// js

    gulp.task('js', function () {
        gulp.src('src/js')
            .pipe(gulp.dest('build/js/'))
    });

// img

    gulp.task('img', function () {
        gulp.src('src/img/**/*.*')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()],
                interlaced: true
            }))
            .pipe(gulp.dest('build/img/'));
    });
// fonts

    gulp.task('fonts', function() {
        gulp.src('src/fonts/**/*.*')
            .pipe(gulp.dest('build/fonts/'))
    });

// min

    gulp.task('css-min', function() {
        gulp.src('src/css/*.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(rename({
                suffix: '.min',
            }))
        .pipe(gulp.dest('build/css/'))
    });

    gulp.task('js-min', function() {
        gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(rename({
                suffix: '.min',
            }))
        .pipe(gulp.dest('build/js/'))
    });
gulp.task('min', [
    'css-min', 'js-min'
]);

// build

gulp.task('build', gulpSequence(
    ['del'],
    ['html', 'js', 'css', 'fonts', 'img', 'min']
));
