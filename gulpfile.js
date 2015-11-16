var gulp = require('gulp');
var concat = require('gulp-concat'); //- 多个文件合并为一个；
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

gulp.task('mjs', function() {
    return gulp.src(['src/*.js', 'src/*/*.js'])
        .pipe(concat('naded.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('asset'));
});

gulp.task('mcss', function() {
    return gulp.src(['src/css/*.css'])
        .pipe(concat('naded.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('asset'));
});

gulp.task('default', ['mjs', 'mcss']);
