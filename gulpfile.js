const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserify = require('gulp-browserify');
const pug = require('gulp-pug');
const babel = require('gulp-babel');

gulp.task('sass', () => {
	gulp.src('src/*.scss')
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(sass.sync())
		.pipe(gulp.dest('./play'));
});

gulp.task('scripts', () => {
	gulp.src('src/index.js')
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(browserify({
			insertGlobals: true,
			debug: !gulp.env.production
		}))
		/*
		.pipe(babel({
			presets: ['es2015']
		}))
		*/
		.pipe(gulp.dest('./play'));
});

gulp.task('pug', () => {
	gulp.src('src/*.pug')
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(pug({}))
		.pipe(gulp.dest('./play'));
});

gulp.task('watch', () => {
	gulp.run('sass');
	gulp.run('scripts');
	gulp.run('pug')
	gulp.watch('src/*.scss', ['sass']);
	gulp.watch('src/*.js', ['scripts']);
	gulp.watch('src/*.pug', ['pug']);
});

gulp.task('default', ['sass', 'scripts', 'pug']);
