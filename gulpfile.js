// npm i
// npm install --save-dev gulp gulp-autoprefixer gulp-csscomb gulp-imagemin gulp-minify-css gulp-rename gulp-rigger gulp-rimraf gulp-sass gulp-sourcemaps gulp-uglify gulp-watch imagemin-pngquant rimraf gulpSequence browser-sync node-bourbon pump gulp-concat
// bower i
// gulp bowerFiles
// gulp (watch)
// gulp build
// gulp min

'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    csscomb = require('gulp-csscomb'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    rename = require("gulp-rename"),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    rimraf = require('rimraf'),
    gulprimraf = require('gulp-rimraf'),
    bourbon = require('node-bourbon'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    pngquant = require('imagemin-pngquant');


// bowerFiles
/////////////////////////////////////////

// bowerJs
gulp.task('bowerJs', function() {
    gulp.src('src/js/rigger/vendors.js')
        .pipe(rigger())
        .pipe(gulp.dest('src/js/'))
        .pipe(reload({ stream: true }));
});

// bowerCss

gulp.task('bowerCss', function() {
    return gulp.src([
            './bower_components/slick-carousel/slick/slick.css'
        ])
        .pipe(concat('_vendors.scss'))
        .pipe(gulp.dest('src/scss/'));
});
gulp.task('bowerNormalizeCss', function() {
    return gulp.src([
            './bower_components/normalize.css/normalize.css'
        ])
        .pipe(concat('_normalize.scss'))
        .pipe(gulp.dest('src/scss/'));
});


// bowerfiles
gulp.task('bowerFilesJs', ['bowerJs']);
gulp.task('bowerFilesCss', ['bowerCss', 'bowerNormalizeCss']);
gulp.task('bowerFiles', ['bowerFilesJs', 'bowerFilesCss']);

// DEV
/////////////////////////////////////////
// scss

gulp.task('scssDev', function() {
    gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/css/'))
        .pipe(reload({ stream: true }));
});
// html

gulp.task('htmlDev', function() {
    gulp.src('src/template/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('src/'))
        .pipe(reload({ stream: true }));
});
// js

gulp.task('jsDev', function() {
    gulp.src('src/js/rigger/**/*.js')
        .pipe(rigger())
        .pipe(gulp.dest('src/js/'))
        .pipe(reload({ stream: true }));
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
gulp.task('webserver', function() {
    browserSync(config);
});

// WATCH

gulp.task('watch', function() {
    watch(['src/js/rigger/vendors.js'], function(event, cb) {
        gulp.start('bowerFilesJs');
    });
    watch(['src/template/**/*.html'], function(event, cb) {
        gulp.start('htmlDev');
    });
    watch(['src/scss/**/*.scss'], function(event, cb) {
        gulp.start('scssDev');
    });
    watch(['src/js/rigger/scripts/*.js'], function(event, cb) {
        gulp.start('jsDev');
    });
});


gulp.task('default', [
    'watch',
    'webserver'
]);



// BUILD
/////////////////////////////////////////
// del

gulp.task('del', function(cb) {
    rimraf('./build', cb);
});
// html

gulp.task('html', function() {
    gulp.src('src/*.html')
        .pipe(gulp.dest('build/'))
});
// css

gulp.task('css', function() {
    gulp.src('src/css/*.css')
        .pipe(autoprefixer('last 15 versions'))
        .pipe(csscomb())
        .pipe(gulp.dest('build/css/'))
});
// js

gulp.task('js', function() {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest('build/js/'))
});

// helpers

gulp.task('helpers', function() {
    gulp.src('src/helpers/*.js')
        .pipe(gulp.dest('build/helpers/'))
});

// img

gulp.task('img', function() {
    gulp.src('src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
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
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(gulp.dest('build/css/'))
});
gulp.task('js-min', function(cb) {
    pump([
            gulp.src('src/js/plugins.min.js'),
            uglify(),
            gulp.dest('build/js/')
        ],
        cb
    );
});
gulp.task('min', [
    'css-min', 'js-min'
]);

// build

gulp.task('build', gulpSequence(
    ['del'], ['html', 'js', 'css', 'fonts', 'img', 'helpers']
));
