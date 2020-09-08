'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const maps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const open = require('gulp-open');
const connect = require('gulp-connect');
const copy = require('gulp-copy');
const mode = require('gulp-mode')();
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const sassLint = require('gulp-sass-lint');

gulp.task('sass', function () {
  return gulp
    .src(['./scss/**/*.scss'])
    .pipe(
      sassLint({
        configFile: './config/.sass-lint.yml',
      }),
    )
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(maps.init())
    .pipe(mode.development(sass().on('error', sass.logError)))
    .pipe(
      mode.production(
        sass({
          outputStyle: 'compressed',
        }),
      ),
    )
    .pipe(rename('style.css'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(connect.reload());
});

gulp.task('js', function () {
  return gulp
    .src(['./js/**/*.js'])
    .pipe(
      eslint({
        useEslintrc: true,
        configFile: './config/.eslintrc',
      }),
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(concat('app.min.js'))
    .pipe(mode.production(uglify()))
    .pipe(mode.production(maps.init()))
    .pipe(mode.production(maps.write('./')))
    .pipe(gulp.dest('./dist/js'))
    .pipe(connect.reload());
});

gulp.task('html', function () {
  return gulp
    .src('./**/*.html', {
      cwd: './html',
    })
    .pipe(copy('./dist'))
    .pipe(connect.reload());
});

gulp.task('img', function () {
  return gulp.src('./img/**').pipe(copy('./dist')).pipe(connect.reload());
});

gulp.task('connect', function (done) {
  connect.server({
    root: './dist',
    port: 8080,
    livereload: true,
  });

  done();
});

gulp.task('fonts', function () {
  return gulp
    .src([
      './node_modules/@fortawesome/fontawesome-free/webfonts/**/*',
      './fonts/**/*',
    ])
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('open', function () {
  return gulp.src('./dist/index.html').pipe(
    open({
      uri: 'http://localhost:8080',
    }),
  );
});

gulp.task('watch', function (done) {
  gulp.watch('./scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./js/**/*.js', gulp.series('js'));
  gulp.watch('./html/**/*.html', gulp.series('html'));
  gulp.watch('./img', gulp.series('img'));

  done();
});

gulp.task(
  'watch',
  gulp.series(
    'js',
    'sass',
    'html',
    'img',
    'fonts',
    gulp.parallel('watch', 'connect', 'open'),
  ),
);

gulp.task('build', gulp.series('js', 'sass', 'html', 'img', 'fonts'));
