'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    csscomb = require('gulp-csscomb'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    rename = require("gulp-rename"),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    rimraf = require('rimraf'),
    gulprimraf = require('gulp-rimraf'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    pngquant = require('imagemin-pngquant'),
    path = {
        srcBower: {
            js: 'src/js/rigger/scripts.js',
            helpers: 'src/js/rigger/helpers.js',
            styles: 'src/scss/rigger/*.css',
            slick: 'src/libs/slick-carousel/slick/slick.css',
            normalize: 'src/libs/normalize-css/normalize.css'
        },
        buildBower: {
            js: 'public_html/js/',
            helpers: 'public_html/js/',
            styles: 'src/scss/'
        },
        fileConcatCss: {
            normalize: '_normalize.scss',
            libs: '_libs.scss'
        },
        srcDev: {
            html: 'src/html/*.html',
            js: 'src/js/rigger/main.js',
            scss: 'src/scss/**/*.scss',
            img: 'src/img/**/*.*',
            fonts: 'src/fonts/**/*.*'
        },
        srcOptim: {
            js: 'public_html/js/**/*.js',
            css: 'public_html/css/**/*.css',
            img: 'public_html/img/**/*.*',
            fonts: 'public_html/fonts/**/*.*'
        },
        buildDev: {
            html: 'public_html/',
            js: 'public_html/js/',
            scss: 'public_html/css/',
            img: 'public_html/img/',
            fonts: 'public_html/fonts/'
        },
        buildOptim: {
            js: 'public_html/js/',
            css: 'public_html/css/',
            img: 'public_html/img/'
        },
        watch: {
            bower: 'src/libs/',
            html: 'src/html/**/*.html',
            js: 'src/js/**/*.js',
            scss: 'src/scss/**/*.scss',
            img: 'src/img/',
            fonts: 'src/fonts/'
        },
        clean: 'public_html/'
    },
    config = {
        server: {
            baseDir: "public_html/"
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "igor"
    };

// bowerCss
gulp.task('bowerCss', function() {
    return gulp.src([
            path.srcBower.slick
        ])
        .pipe(concat(path.fileConcatCss.libs))
        .pipe(gulp.dest(path.buildBower.styles));
});
// bowerNormalize
gulp.task('bowerNormalize', function() {
    return gulp.src(path.srcBower.normalize)
        .pipe(concat(path.fileConcatCss.normalize))
        .pipe(gulp.dest(path.buildBower.styles));
});

// bowerJs
gulp.task('bowerJs', function() {
    gulp.src(path.srcBower.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.buildBower.js));
});
// bowerHelpers
gulp.task('bowerHelpers', function() {
    gulp.src(path.srcBower.helpers)
        .pipe(rigger())
        .pipe(gulp.dest(path.buildBower.helpers));
});

// bowerFiles
gulp.task('bowerFiles', ['bowerCss', 'bowerNormalize', 'bowerJs', 'bowerHelpers'], function() {
        gulp.pipe(reload({ stream: true }));
});

// scssDev

gulp.task('scssDev', function() {
    gulp.src(path.srcDev.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.buildDev.scss))
        .pipe(reload({ stream: true }));
});

// htmlDev
gulp.task('htmlDev', function() {
    gulp.src(path.srcDev.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.buildDev.html))
        .pipe(reload({ stream: true }));
});

// jsDev
gulp.task('jsDev', function() {
    gulp.src(path.srcDev.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.buildDev.js))
        .pipe(reload({ stream: true }));
});

// imgDev
gulp.task('imgDev', function() {
    gulp.src(path.srcDev.img)
        .pipe(gulp.dest(path.buildDev.img))
        .pipe(reload({ stream: true }));
});

// fontsDev
gulp.task('fontsDev', function() {
    gulp.src(path.srcDev.fonts)
        .pipe(gulp.dest(path.buildDev.fonts))
        .pipe(reload({ stream: true }));
});

// WATCH
gulp.task('watch', function() {
    watch([path.watch.bower], function(event, cb) {
        gulp.start(['bowerFiles']);
    });
    watch([path.watch.scss], function(event, cb) {
        gulp.start('scssDev');
    });
    watch([path.watch.html], function(event, cb) {
        gulp.start('htmlDev');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('jsDev');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('imgDev');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fontsDev');
    });
});

// WEBSERVER

gulp.task('webserver', function() {
    browserSync(config);
});

// DEFAULT
gulp.task('default', [
    'watch',
    'webserver'
]);

// cleanBuild
gulp.task('cleanBuild', function(cb) {
    rimraf(path.clean, cb);
});

// cssOptim
gulp.task('cssOptim', function() {
    gulp.src(path.srcOptim.css)
        .pipe(autoprefixer('last 15 versions'))
        .pipe(csscomb())
        .pipe(gulp.dest(path.buildOptim.css));
});

// imgOptim
gulp.task('imgOptim', function() {
    gulp.src(path.srcOptim.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.buildOptim.img));
});

// cssMin
gulp.task('cssMin', function() {
    gulp.src(path.srcOptim.css)
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.buildOptim.css));
});

// jsMin
gulp.task('jsMin', function(cb) {
    pump([
            gulp.src(path.srcOptim.js),
            uglify(),
            rename({suffix: '.min'}),
            gulp.dest(path.buildOptim.js)
        ],
        cb
    );
});
gulp.task('minFiles', ['cssMin', 'jsMin']);

// filesOptimiz
gulp.task('filesOptimiz', ['cssOptim', 'imgOptim', 'minFiles']);