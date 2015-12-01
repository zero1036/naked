var gulp = require('gulp');
var concat = require('gulp-concat'); //- 多个文件合并为一个；
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var bom = require('gulp-bom');

gulp.task('mjs', function() {
    return gulp.src(['src/module/*.js', 'src/module/*/*.js'])
        .pipe(concat('naked.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('asset'));
});

gulp.task('cjs', function() {
    return gulp.src(['src/module/*.js', 'src/module/*/*.js'])
        .pipe(bom())
        .pipe(concat('naked.js'))
        .pipe(gulp.dest('asset'));
});

gulp.task('mcss', function() {
    return gulp.src(['src/css/*.css'])
        .pipe(concat('naked.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('asset'));
});

gulp.task('default', ['cjs', 'mjs', 'mcss']);
